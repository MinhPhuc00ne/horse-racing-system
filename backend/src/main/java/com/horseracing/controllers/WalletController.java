package com.horseracing.controllers;

import com.fasterxml.jackson.databind.node.ObjectNode;
import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.WalletTransaction;
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

    @PostMapping("/withdraw")
    public ResponseEntity<WalletTransaction> withdraw(@RequestBody Map<String, Object> request, Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        
        WalletTransaction tx = walletService.requestWithdrawal(user, amount);
        return ResponseEntity.ok(tx);
    }

    @GetMapping("/transactions")
    public ResponseEntity<List<WalletTransaction>> getHistory(Authentication authentication) {
        User user = getAuthenticatedUser(authentication);
        return ResponseEntity.ok(walletService.getTransactionHistory(user));
    }
}
