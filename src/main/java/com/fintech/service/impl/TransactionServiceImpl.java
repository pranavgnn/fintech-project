package com.fintech.service.impl;

import com.fintech.dto.TransactionRequest;
import com.fintech.dto.TransferRequest;
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
    @Transactional
    public TransactionResponse transferBetweenAccounts(Long userId, TransferRequest request) {
        // Verify the source account belongs to the user
        Account fromAccount = accountRepository.findById(request.getFromAccountId())
                .orElseThrow(() -> new ResourceNotFoundException("Source account not found"));

        // Validate account ownership - throws exception if not owner
        accountService.validateAccountOwnership(userId, fromAccount.getId());

        // Find destination account by account number
        Account toAccount = accountRepository.findByAccountNumber(request.getToAccountNumber())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Destination account not found with number: " + request.getToAccountNumber()));

        // Validate the transaction
        validateTransaction(fromAccount.getId(), toAccount.getId(), request.getAmount().doubleValue());

        // Create transaction with current timestamp
        Transaction transaction = new Transaction();
        transaction.setFromAccount(fromAccount);
        transaction.setToAccount(toAccount);
        transaction.setAmount(request.getAmount());
        transaction.setTimestamp(LocalDateTime.now());
        transaction.setStatus(TransactionStatus.PENDING);
        transaction.setDescription(request.getDescription() != null ? request.getDescription()
                : "Transfer from " + fromAccount.getAccountNumber() + " to " + toAccount.getAccountNumber());

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
    public List<TransactionResponse> getAllUserTransactions(Long userId) {
        // Get all accounts owned by the user
        List<Account> userAccounts = accountRepository.findByUserId(userId);

        if (userAccounts.isEmpty()) {
            return List.of(); // Return empty list if user has no accounts
        }

        // Get IDs of all accounts
        List<Long> accountIds = userAccounts.stream()
                .map(Account::getId)
                .collect(Collectors.toList());

        // Get all transactions where user's accounts are involved (either as source or
        // destination)
        List<Transaction> transactions = transactionRepository.findByFromAccountIdInOrToAccountIdIn(accountIds,
                accountIds);

        // Convert to DTOs
        return transactions.stream()
                .map(this::convertToTransactionResponse)
                .sorted((t1, t2) -> t2.getTimestamp().compareTo(t1.getTimestamp())) // Most recent first
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
        response.setFromAccountNumber(
                transaction.getFromAccount() != null ? transaction.getFromAccount().getAccountNumber() : null);
        response.setToAccountNumber(
                transaction.getToAccount() != null ? transaction.getToAccount().getAccountNumber() : null);
        response.setAmount(transaction.getAmount());

        // Ensure timestamp is properly set
        if (transaction.getTimestamp() == null) {
            response.setTimestamp(LocalDateTime.now());
        } else {
            response.setTimestamp(transaction.getTimestamp());
        }

        response.setStatus(transaction.getStatus());
        response.setDescription(transaction.getDescription());
        return response;
    }
}