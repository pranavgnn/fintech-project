package com.fintech.service.impl;

import com.fintech.dto.response.AdminDashboardStats;
import com.fintech.repository.AccountRepository;
import com.fintech.repository.OfferRepository;
import com.fintech.repository.TransactionRepository;
import com.fintech.repository.UserRepository;
import com.fintech.service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final AccountRepository accountRepository;
    private final TransactionRepository transactionRepository;
    private final OfferRepository offerRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminDashboardStats getDashboardStats() {
        log.info("Generating admin dashboard statistics");

        // Use count methods from repositories to avoid loading all entities
        long totalUsers = userRepository.count();
        long totalAccounts = accountRepository.count();
        long totalTransactions = transactionRepository.count();
        long activeOffers = offerRepository.countByActiveTrue();

        // Use a direct aggregation query instead of loading all accounts
        BigDecimal totalBalance = accountRepository.findTotalBalance();
        // No need to check for null as the query uses COALESCE

        log.info("Dashboard stats: users={}, accounts={}, transactions={}, offers={}, balance={}",
                totalUsers, totalAccounts, totalTransactions, activeOffers, totalBalance);

        return AdminDashboardStats.builder()
                .totalUsers(totalUsers)
                .totalAccounts(totalAccounts)
                .totalTransactions(totalTransactions)
                .activeOffers(activeOffers)
                .totalBalance(totalBalance)
                .build();
    }
}
