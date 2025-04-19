package com.project.controller;

import com.project.entity.Account;
import com.project.entity.Customer;
import com.project.service.AccountService;
import com.project.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/accounts")
@CrossOrigin(origins = "*")
public class AccountController {

    @Autowired
    private AccountService accountService;

    @Autowired
    private CustomerService customerService;

    private static final Logger logger = Logger.getLogger(AccountController.class.getName());

    @GetMapping
    public ResponseEntity<List<Account>> getAllAccounts() {
        return ResponseEntity.ok(accountService.getAllAccounts());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Account> getAccountById(@PathVariable Long id) {
        Optional<Account> account = accountService.getAccountById(id);
        return account.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<Account>> getAccountsByCustomerId(@PathVariable Long customerId) {
        List<Account> accounts = accountService.getAccountsByCustomerId(customerId);
        return ResponseEntity.ok(accounts);
    }

    @PostMapping
    public ResponseEntity<Account> createAccount(@RequestBody Account account) {
        Account savedAccount = accountService.saveAccount(account);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedAccount);
    }

    @PostMapping("/assign")
    public ResponseEntity<?> assignAccountToCustomer(@RequestParam Long accountId, @RequestParam Long customerId) {
        try {
            logger.info("Assigning account ID " + accountId + " to customer ID " + customerId);

            Optional<Account> accountOpt = accountService.getAccountById(accountId);
            Optional<Customer> customerOpt = customerService.getCustomerById(customerId);

            if (!accountOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Account not found with ID: " + accountId);
            }

            if (!customerOpt.isPresent()) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Customer not found with ID: " + customerId);
            }

            Account account = accountOpt.get();
            Customer customer = customerOpt.get();

            account.setCustomer(customer);
            Account updatedAccount = accountService.saveAccount(account);

            return ResponseEntity.ok(updatedAccount);
        } catch (Exception e) {
            logger.severe("Error assigning account to customer: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to assign account to customer: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Account> updateAccount(
            @PathVariable Long id,
            @RequestBody Account account) {
        Optional<Account> existingAccount = accountService.getAccountById(id);

        if (existingAccount.isPresent()) {
            account.setId(id);
            Account updatedAccount = accountService.saveAccount(account);
            return ResponseEntity.ok(updatedAccount);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAccount(@PathVariable Long id) {
        accountService.deleteAccount(id);
        return ResponseEntity.noContent().build();
    }
}
