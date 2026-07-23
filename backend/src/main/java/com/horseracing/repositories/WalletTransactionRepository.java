package com.horseracing.repositories;

import com.horseracing.entities.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Integer> {
    List<WalletTransaction> findByWalletIdOrderByCreatedAtDesc(Integer walletId);

    Optional<WalletTransaction> findByPayosOrderCode(Long payosOrderCode);

    List<WalletTransaction> findByTransactionTypeOrderByCreatedAtDesc(String transactionType);

    long countByTransactionTypeAndStatus(String transactionType, String status);

    @Query("SELECT t FROM WalletTransaction t WHERE t.status = 'PENDING' AND t.transactionType = 'DEPOSIT' AND t.referenceType = 'PAYOS' AND t.createdAt < :cutoff")
    List<WalletTransaction> findAllPendingPayosDepositsBefore(
            @Param("cutoff") LocalDateTime cutoff);
}
