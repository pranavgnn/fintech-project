package com.project.controller;

import com.project.entity.Customer;
import com.project.entity.Offer;
import com.project.service.CustomerService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin(origins = "*") // Allow requests from any origin
public class CustomerController {

    @Autowired
    private CustomerService customerService;

    private static final Logger logger = Logger.getLogger(CustomerController.class.getName());

    @GetMapping
    public ResponseEntity<List<Customer>> getAllCustomers() {
        return ResponseEntity.ok(customerService.getAllCustomers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Customer> getCustomerById(@PathVariable Long id) {
        Optional<Customer> customer = customerService.getCustomerById(id);
        return customer.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<?> createCustomer(@RequestBody Customer customer) {
        try {
            logger.info("Creating new customer: " + customer.getName());

            // Ensure collections are initialized
            if (customer.getAccounts() == null) {
                customer.setAccounts(new ArrayList<>());
            }
            if (customer.getOffers() == null) {
                customer.setOffers(new HashSet<>());
            }

            Customer savedCustomer = customerService.saveCustomer(customer);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedCustomer);
        } catch (Exception e) {
            logger.severe("Error creating customer: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to create customer: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Customer> updateCustomer(@PathVariable Long id, @RequestBody Customer customer) {
        return customerService.getCustomerById(id)
                .map(existing -> {
                    customer.setId(id);
                    return ResponseEntity.ok(customerService.saveCustomer(customer));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCustomer(@PathVariable Long id) {
        customerService.deleteCustomer(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/offers")
    public ResponseEntity<Set<Offer>> getCustomerOffers(@PathVariable Long id) {
        Set<Offer> offers = customerService.getCustomerOffers(id);
        return offers != null ? ResponseEntity.ok(offers) : ResponseEntity.notFound().build();
    }
}
