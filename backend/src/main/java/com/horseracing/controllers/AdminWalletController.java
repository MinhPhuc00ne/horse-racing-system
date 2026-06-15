package com.horseracing.controllers;

import com.horseracing.services.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/wallets")
@RequiredArgsConstructor
public class AdminWalletController {

    private final WalletService walletService;

    @PutMapping("/transactions/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> approveWithdrawal(@PathVariable Integer id) {
        walletService.approveWithdrawal(id);
        return ResponseEntity.ok("Withdrawal approved successfully");
    }

    @PutMapping("/transactions/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<String> rejectWithdrawal(@PathVariable Integer id) {
        walletService.rejectWithdrawal(id);
        return ResponseEntity.ok("Withdrawal rejected, balance refunded");
    }
}
