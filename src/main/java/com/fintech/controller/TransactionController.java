package com.fintech.controller;

import com.fintech.dto.TransactionRequest;
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
@RequestMapping("/api/users/{userId}/accounts/{accountId}/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<TransactionResponse> createTransaction(
            @PathVariable Long userId,
            @PathVariable Long accountId,
            @Valid @RequestBody TransactionRequest request) {
        return new ResponseEntity<>(
                transactionService.createTransaction(userId, accountId, request),
                HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<TransactionResponse>> getAccountTransactions(
            @PathVariable Long userId,
            @PathVariable Long accountId) {
        return ResponseEntity.ok(transactionService.getAccountTransactions(userId, accountId));
    }
}