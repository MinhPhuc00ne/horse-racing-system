package com.horseracing.controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.WalletTransaction;
import com.horseracing.dto.response.UserResponse;
import com.horseracing.repositories.UserRepository;
import com.horseracing.services.PaymentService;
import com.horseracing.services.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/wallets")
@RequiredArgsConstructor
public class WalletController {

    private final WalletService walletService;
    private final PaymentService paymentService;
    private final UserRepository userRepository;

    private User getAuthenticatedUser(Authentication authentication) {
        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        return userRepository.findByEmail(userDetails.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @GetMapping("/balance")
    public ResponseEntity<Wallet> getBalance(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(walletService.getOrCreateWallet(user));
    }

    @PostMapping("/deposit")
    public ResponseEntity<ObjectNode> deposit(@RequestBody Map<String, Object> request, Authentication authentication) throws Exception {
        User user = getAuthenticatedUser(authentication);
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        String returnUrl = request.getOrDefault("returnUrl", "http://localhost:5173/payment-success").toString();
        String cancelUrl = request.getOrDefault("cancelUrl", "http://localhost:5173/payment-cancel").toString();
        
        ObjectNode res = paymentService.createPaymentLink(user, amount, returnUrl, cancelUrl);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/deposit/status/{orderCode}")
    public ResponseEntity<Map<String, Object>> getDepositStatus(@PathVariable long orderCode) {
        String status = paymentService.checkDepositStatus(orderCode);
        return ResponseEntity.ok(Map.of("orderCode", orderCode, "status", status));
    }

    @PostMapping("/withdraw")
    public ResponseEntity<WalletTransaction> withdraw(@RequestBody Map<String, Object> request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        
        String bankName = (String) request.get("bankName");
        String bankBin = (String) request.get("bankBin");
        String bankAccountNumber = (String) request.get("bankAccountNumber");
        String bankAccountHolderName = (String) request.get("bankAccountHolderName");
        
        // 1. Fallback to new User profile fields if missing in request
        if (bankName == null || bankName.isBlank()) bankName = user.getBankName();
        if (bankBin == null || bankBin.isBlank()) bankBin = user.getBankBin();
        if (bankAccountNumber == null || bankAccountNumber.isBlank()) bankAccountNumber = user.getBankAccountNumber();
        if (bankAccountHolderName == null || bankAccountHolderName.isBlank()) bankAccountHolderName = user.getBankAccountHolderName();
        
        // 2. Fallback to old Jockey/Owner profiles if still missing
        if (bankAccountNumber == null || bankAccountNumber.isBlank()) {
            bankAccountNumber = walletService.getBankAccountForUser(user);
            if (bankAccountNumber != null && !bankAccountNumber.isBlank()) {
                bankAccountHolderName = user.getFullName(); // Use full name as default holder
                bankName = "Default Bank (Profile)";
                bankBin = "000000"; // default placeholder
            }
        }
        
        // 3. Default optional missing fields if bankName & bankAccountNumber are present
        if (bankName != null && !bankName.isBlank() && bankAccountNumber != null && !bankAccountNumber.isBlank()) {
            if (bankBin == null || bankBin.isBlank()) bankBin = "000000";
            if (bankAccountHolderName == null || bankAccountHolderName.isBlank()) bankAccountHolderName = user.getFullName();
        }
        
        // 4. Throw exception only if core info is missing
        if (bankName == null || bankName.isBlank() ||
            bankAccountNumber == null || bankAccountNumber.isBlank()) {
            throw new RuntimeException("Bank name and recipient account number are required");
        }
        
        WalletTransaction tx = walletService.requestWithdrawal(user, amount, bankName, bankBin, bankAccountNumber, bankAccountHolderName);
        return ResponseEntity.ok(tx);
    }

    @PutMapping("/bank-account")
    public ResponseEntity<UserResponse> updateBankAccount(@RequestBody Map<String, String> request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        String bankName = request.get("bankName");
        String bankBin = request.get("bankBin");
        String bankAccountNumber = request.get("bankAccountNumber");
        String bankAccountHolderName = request.get("bankAccountHolderName");
        
        if (bankBin == null || bankBin.isBlank()) {
            bankBin = "000000";
        }
        if (bankAccountHolderName == null || bankAccountHolderName.isBlank()) {
            bankAccountHolderName = user.getFullName();
        }
        
        if (bankName == null || bankName.isBlank() ||
            bankAccountNumber == null || bankAccountNumber.isBlank()) {
            throw new RuntimeException("Bank name and account number cannot be empty");
        }
        
        user.setBankName(bankName);
        user.setBankBin(bankBin);
        user.setBankAccountNumber(bankAccountNumber);
        user.setBankAccountHolderName(bankAccountHolderName);
        
        userRepository.save(user);
        return ResponseEntity.ok(UserResponse.fromEntity(user));
    }

    @PutMapping("/transactions/{id}/cancel")
    public ResponseEntity<WalletTransaction> cancelWithdrawal(@PathVariable Integer id, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        WalletTransaction tx = walletService.cancelWithdrawal(id, user);
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransaction>> getHistory(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(walletService.getTransactionHistory(user));
    }
}
