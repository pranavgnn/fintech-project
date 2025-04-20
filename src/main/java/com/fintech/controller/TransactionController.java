package com.fintech.controller;

import com.fintech.dto.TransactionRequest;
import com.fintech.dto.TransferRequest;
import com.fintech.dto.response.TransactionResponse;
import com.fintech.service.TransactionService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    // Account-specific transactions
    @PostMapping("/api/users/{userId}/accounts/{accountId}/transactions")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<TransactionResponse> createTransaction(
            @PathVariable Long userId,
            @PathVariable Long accountId,
            @Valid @RequestBody TransactionRequest request) {
        return new ResponseEntity<>(
                transactionService.createTransaction(userId, accountId, request),
                HttpStatus.CREATED);
    }

    @GetMapping("/api/users/{userId}/accounts/{accountId}/transactions")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<TransactionResponse>> getAccountTransactions(
            @PathVariable Long userId,
            @PathVariable Long accountId) {
        return ResponseEntity.ok(transactionService.getAccountTransactions(userId, accountId));
    }

    // Transfer between accounts
    @PostMapping("/api/users/{userId}/transfers")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<TransactionResponse> transferBetweenAccounts(
            @PathVariable Long userId,
            @Valid @RequestBody TransferRequest request) {
        return new ResponseEntity<>(
                transactionService.transferBetweenAccounts(userId, request),
                HttpStatus.CREATED);
    }

    // Get all user transactions across all accounts
    @GetMapping("/api/users/{userId}/transactions")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<TransactionResponse>> getAllUserTransactions(
            @PathVariable Long userId) {
        return ResponseEntity.ok(transactionService.getAllUserTransactions(userId));
    }
}