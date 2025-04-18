package com.fintech.controller;

import com.fintech.dto.AccountRequest;
import com.fintech.dto.response.AccountResponse;
import com.fintech.service.AccountService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<List<AccountResponse>> getUserAccounts(@PathVariable Long userId) {
        return ResponseEntity.ok(accountService.getUserAccounts(userId));
    }

    @GetMapping("/{accountId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<AccountResponse> getAccountById(
            @PathVariable Long userId,
            @PathVariable Long accountId) {
        return ResponseEntity.ok(accountService.getAccountById(userId, accountId));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN') or #userId == authentication.principal.id")
    public ResponseEntity<AccountResponse> createAccount(
            @PathVariable Long userId,
            @Valid @RequestBody AccountRequest request) {
        return new ResponseEntity<>(accountService.createAccount(userId, request), HttpStatus.CREATED);
    }
}