package com.horseracing.repositories;

import com.horseracing.entities.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Integer> {
    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Integer walletId);
    Optional<WalletTransaction> findByPayosOrderCode(Long payosOrderCode);
}
