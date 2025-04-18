package com.fintech.repository;

import com.fintech.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findByFromAccountId(Long accountId);

    List<Transaction> findByToAccountId(Long accountId);

    List<Transaction> findByFromAccountIdOrToAccountId(Long fromAccountId, Long toAccountId);
}