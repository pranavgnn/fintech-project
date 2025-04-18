package com.fintech.service;

import com.fintech.dto.AccountRequest;
import com.fintech.dto.response.AccountResponse;

import java.util.List;

public interface AccountService {
    AccountResponse createAccount(Long userId, AccountRequest request);

    AccountResponse getAccountById(Long userId, Long accountId);

    List<AccountResponse> getUserAccounts(Long userId);

    void validateAccountOwnership(Long userId, Long accountId);
}