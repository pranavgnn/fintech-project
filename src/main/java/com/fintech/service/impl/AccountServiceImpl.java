package com.fintech.service.impl;

import com.fintech.dto.AccountRequest;
import com.fintech.dto.response.AccountResponse;
import com.fintech.entity.Account;
import com.fintech.entity.User;
import com.fintech.exception.ForbiddenException;
import com.fintech.exception.ResourceNotFoundException;
import com.fintech.repository.AccountRepository;
import com.fintech.repository.UserRepository;
import com.fintech.service.AccountService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AccountServiceImpl implements AccountService {

    private final AccountRepository accountRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public AccountResponse createAccount(Long userId, AccountRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Account account = new Account();
        account.setAccountNumber(generateAccountNumber());
        account.setBalance(request.getInitialBalance());
        account.setType(request.getType());
        account.setUser(user);

        Account savedAccount = accountRepository.save(account);
        return convertToAccountResponse(savedAccount);
    }

    @Override
    public AccountResponse getAccountById(Long userId, Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        validateAccountOwnership(userId, accountId);
        return convertToAccountResponse(account);
    }

    @Override
    public List<AccountResponse> getUserAccounts(Long userId) {
        return accountRepository.findByUserId(userId).stream()
                .map(this::convertToAccountResponse)
                .collect(Collectors.toList());
    }

    @Override
    public void validateAccountOwnership(Long userId, Long accountId) {
        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> new ResourceNotFoundException("Account not found"));

        if (!account.getUser().getId().equals(userId)) {
            throw new ForbiddenException("You don't have access to this account");
        }
    }

    private String generateAccountNumber() {
        String accountNumber;
        do {
            accountNumber = UUID.randomUUID().toString().replace("-", "").substring(0, 12);
        } while (accountRepository.existsByAccountNumber(accountNumber));
        return accountNumber;
    }

    private AccountResponse convertToAccountResponse(Account account) {
        AccountResponse response = new AccountResponse();
        response.setId(account.getId());
        response.setAccountNumber(account.getAccountNumber());
        response.setBalance(account.getBalance());
        response.setType(account.getType());
        return response;
    }
}