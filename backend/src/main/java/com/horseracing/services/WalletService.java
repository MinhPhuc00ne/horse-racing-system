package com.horseracing.services;

import com.horseracing.entities.User;
import com.horseracing.entities.Wallet;
import com.horseracing.entities.WalletTransaction;
import com.horseracing.repositories.WalletRepository;
import com.horseracing.repositories.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final WalletRepository walletRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    public Wallet getOrCreateWallet(User user) {
        return walletRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Wallet newWallet = Wallet.builder()
                            .user(user)
                            .balance(BigDecimal.ZERO)
                            .build();
                    return walletRepository.save(newWallet);
                });
    }

    @Transactional
    public WalletTransaction createPendingDeposit(User user, BigDecimal amount, Long payosOrderCode) {
        Wallet wallet = getOrCreateWallet(user);
        
        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .transactionType("DEPOSIT")
                .amount(amount)
                .status("PENDING")
                .referenceType("PAYOS")
                .payosOrderCode(payosOrderCode)
                .build();
                
        return walletTransactionRepository.save(transaction);
    }

    @Transactional
    public WalletTransaction requestWithdrawal(User user, BigDecimal amount) {
        Wallet wallet = getOrCreateWallet(user);
        
        if (wallet.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }
        
        // Freeze balance
        wallet.setBalance(wallet.getBalance().subtract(amount));
        walletRepository.save(wallet);

        WalletTransaction transaction = WalletTransaction.builder()
                .wallet(wallet)
                .transactionType("WITHDRAW")
                .amount(amount)
                .status("PENDING")
                .build();
                
        return walletTransactionRepository.save(transaction);
    }
    
    @Transactional
    public void approveWithdrawal(Integer transactionId) {
        WalletTransaction transaction = walletTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
                
        if (!"PENDING".equals(transaction.getStatus()) || !"WITHDRAW".equals(transaction.getTransactionType())) {
            throw new RuntimeException("Invalid transaction state");
        }
        
        transaction.setStatus("SUCCESS");
        walletTransactionRepository.save(transaction);
    }
    
    @Transactional
    public void rejectWithdrawal(Integer transactionId) {
        WalletTransaction transaction = walletTransactionRepository.findById(transactionId)
                .orElseThrow(() -> new RuntimeException("Transaction not found"));
                
        if (!"PENDING".equals(transaction.getStatus()) || !"WITHDRAW".equals(transaction.getTransactionType())) {
            throw new RuntimeException("Invalid transaction state");
        }
        
        transaction.setStatus("FAILED");
        walletTransactionRepository.save(transaction);
        
        // Refund balance
        Wallet wallet = transaction.getWallet();
        wallet.setBalance(wallet.getBalance().add(transaction.getAmount()));
        walletRepository.save(wallet);
    }

    public List<WalletTransaction> getTransactionHistory(User user) {
        Wallet wallet = getOrCreateWallet(user);
        return walletTransactionRepository.findByWalletIdOrderByCreatedAtDesc(wallet.getId());
    }
}
