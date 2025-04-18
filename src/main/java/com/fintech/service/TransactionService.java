package com.fintech.service;

import com.fintech.dto.TransactionRequest;
import com.fintech.dto.response.TransactionResponse;

import java.util.List;

public interface TransactionService {
    TransactionResponse createTransaction(Long userId, Long accountId, TransactionRequest request);

    List<TransactionResponse> getAccountTransactions(Long userId, Long accountId);

    void validateTransaction(Long fromAccountId, Long toAccountId, Double amount);
}