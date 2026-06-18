package com.horseracing.repositories;

import com.horseracing.entities.BettingTransaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BettingTransactionRepository extends JpaRepository<BettingTransaction, Integer> {
    List<BettingTransaction> findByBetId(Integer betId);
}
