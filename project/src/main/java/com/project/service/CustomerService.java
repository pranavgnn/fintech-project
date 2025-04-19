package com.project.service;

import com.project.entity.Customer;
import com.project.entity.Offer;
import com.project.repository.CustomerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.logging.Logger;

@Service
public class CustomerService {

    private static final Logger logger = Logger.getLogger(CustomerService.class.getName());

    @Autowired
    private CustomerRepository customerRepository;

    public List<Customer> getAllCustomers() {
        try {
            logger.info("Fetching all customers");
            return customerRepository.findAll();
        } catch (Exception e) {
            logger.severe("Error fetching all customers: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Optional<Customer> getCustomerById(Long id) {
        try {
            logger.info("Fetching customer with ID: " + id);
            return customerRepository.findById(id);
        } catch (Exception e) {
            logger.severe("Error fetching customer by ID: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public Customer saveCustomer(Customer customer) {
        try {
            logger.info("Saving customer: " + customer.getName());

            // Ensure collections are initialized to prevent NPE
            if (customer.getAccounts() == null) {
                customer.setAccounts(new ArrayList<>());
            }

            if (customer.getOffers() == null) {
                customer.setOffers(new HashSet<>());
            }

            return customerRepository.save(customer);
        } catch (Exception e) {
            logger.severe("Error saving customer: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void deleteCustomer(Long id) {
        try {
            logger.info("Deleting customer with ID: " + id);
            customerRepository.deleteById(id);
        } catch (Exception e) {
            logger.severe("Error deleting customer: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional(readOnly = true)
    public Set<Offer> getCustomerOffers(Long customerId) {
        try {
            logger.info("Fetching offers for customer ID: " + customerId);
            Optional<Customer> customerOpt = customerRepository.findById(customerId);
            if (customerOpt.isPresent()) {
                // Create a new set to avoid serialization issues
                return new HashSet<>(customerOpt.get().getOffers());
            }
            return new HashSet<>();
        } catch (Exception e) {
            logger.severe("Error fetching customer offers: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }
}
