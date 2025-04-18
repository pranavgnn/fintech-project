package com.fintech.service.impl;

import com.fintech.dto.TransactionRequest;
import com.fintech.dto.response.TransactionResponse;
import com.fintech.entity.Account;
import com.fintech.entity.Transaction;
import com.fintech.entity.TransactionStatus;
import com.fintech.exception.BadRequestException;
import com.fintech.exception.ResourceNotFoundException;
import com.fintech.repository.AccountRepository;
import com.fintech.repository.TransactionRepository;
import com.fintech.service.AccountService;
import com.fintech.service.TransactionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TransactionServiceImpl implements TransactionService {

    private final TransactionRepository transactionRepository;
    private final AccountRepository accountRepository;
    private final AccountService accountService;

    @Override
    @Transactional
    public TransactionResponse createTransaction(Long userId, Long fromAccountId, TransactionRequest request) {
        Account fromAccount = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));

        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException("Destination account not found"));

        // Validate account ownership
        accountService.validateAccountOwnership(userId, fromAccountId);

        // Validate transaction
        validateTransaction(fromAccountId, toAccount.getId(), request.getAmount().doubleValue());

        // Create transaction
        Transaction transaction = new Transaction();
        transaction.setFromAccount(fromAccount);
        transaction.setToAccount(toAccount);
        transaction.setAmount(request.getAmount());
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setDescription(request.getDescription());

        // Update account balances
        fromAccount.setBalance(fromAccount.getBalance().subtract(request.getAmount()));
        toAccount.setBalance(toAccount.getBalance().add(request.getAmount()));

        // Save transaction and update accounts
        Transaction savedTransaction = transactionRepository.save(transaction);
        accountRepository.save(fromAccount);
        accountRepository.save(toAccount);

        // Update transaction status
        savedTransaction.setStatus(TransactionStatus.COMPLETED);
        return convertToTransactionResponse(transactionRepository.save(savedTransaction));
    }

    @Override
    public List<TransactionResponse> getAccountTransactions(Long userId, Long accountId) {
        // Validate account ownership
        accountService.validateAccountOwnership(userId, accountId);

        return transactionRepository.findByFromAccountIdOrToAccountId(accountId, accountId).stream()
                .map(this::convertToTransactionResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void validateTransaction(Long fromAccountId, Long toAccountId, Double amount) {
        if (fromAccountId.equals(toAccountId)) {
            throw new BadRequestException("Cannot transfer money to the same account");
        }

        Account fromAccount = accountRepository.findById(fromAccountId)
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));

        if (fromAccount.getBalance().doubleValue() < amount) {
            throw new BadRequestException("Insufficient balance");
        }
    }

    private TransactionResponse convertToTransactionResponse(Transaction transaction) {
        TransactionResponse response = new TransactionResponse();
        response.setId(transaction.getId());
        response.setFromAccountNumber(transaction.getFromAccount().getAccountNumber());
        response.setToAccountNumber(transaction.getToAccount().getAccountNumber());
        response.setAmount(transaction.getAmount());
        response.setTimestamp(transaction.getTimestamp());
        response.setStatus(transaction.getStatus());
        response.setDescription(transaction.getDescription());
        return response;
    }
}