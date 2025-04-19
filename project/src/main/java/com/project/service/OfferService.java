package com.project.service;

import com.project.entity.Customer;
import com.project.entity.Offer;
import com.project.repository.CustomerRepository;
import com.project.repository.OfferRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.logging.Logger;

@Service
public class OfferService {

    private static final Logger logger = Logger.getLogger(OfferService.class.getName());

    @Autowired
    private OfferRepository offerRepository;

    @Autowired
    private CustomerRepository customerRepository;

    public List<Offer> getAllOffers() {
        try {
            logger.info("Fetching all offers");
            return offerRepository.findAll();
        } catch (Exception e) {
            logger.severe("Error fetching all offers: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public Optional<Offer> getOfferById(Long id) {
        try {
            logger.info("Fetching offer with ID: " + id);
            return offerRepository.findById(id);
        } catch (Exception e) {
            logger.severe("Error fetching offer by ID: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    public List<Offer> getActiveOffers() {
        try {
            logger.info("Fetching active offers");
            return offerRepository.findByValidTillAfter(LocalDateTime.now());
        } catch (Exception e) {
            logger.severe("Error fetching active offers: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public Offer createOffer(Offer offer) {
        try {
            logger.info("Creating new offer: " + offer.getOfferType());

            // Ensure dates are properly set
            if (offer.getCreatedAt() == null) {
                offer.setCreatedAt(LocalDate.now());
            }

            // Convert string date to LocalDate if needed
            if (offer.getValidTill() == null) {
                logger.warning("Valid till date is null, setting default expiration");
                offer.setValidTill(LocalDate.now().plusMonths(3));
            }

            // Initialize empty collections
            if (offer.getCustomers() == null) {
                offer.setCustomers(new HashSet<>());
            }

            return offerRepository.save(offer);
        } catch (Exception e) {
            logger.severe("Error creating offer: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public void deleteOffer(Long id) {
        try {
            logger.info("Deleting offer with ID: " + id);
            offerRepository.deleteById(id);
        } catch (Exception e) {
            logger.severe("Error deleting offer: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    @Transactional
    public boolean assignOfferToCustomer(Long offerId, Long customerId) {
        try {
            logger.info("Assigning offer " + offerId + " to customer " + customerId);

            Optional<Offer> offerOpt = offerRepository.findById(offerId);
            Optional<Customer> customerOpt = customerRepository.findById(customerId);

            if (offerOpt.isPresent() && customerOpt.isPresent()) {
                Offer offer = offerOpt.get();
                Customer customer = customerOpt.get();

                // Add to both sides of the relationship
                customer.getOffers().add(offer);
                offer.getCustomers().add(customer);

                // Save both entities
                customerRepository.save(customer);
                offerRepository.save(offer);
                logger.info("Successfully assigned offer to customer");
                return true;
            } else {
                logger.warning("Offer or customer not found");
                return false;
            }
        } catch (Exception e) {
            logger.severe("Error assigning offer to customer: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }

    @Transactional
    public boolean removeOfferFromCustomer(Long offerId, Long customerId) {
        try {
            logger.info("Removing offer " + offerId + " from customer " + customerId);

            Optional<Offer> offerOpt = offerRepository.findById(offerId);
            Optional<Customer> customerOpt = customerRepository.findById(customerId);

            if (offerOpt.isPresent() && customerOpt.isPresent()) {
                Offer offer = offerOpt.get();
                Customer customer = customerOpt.get();

                // Remove from both sides of the relationship
                customer.getOffers().remove(offer);
                offer.getCustomers().remove(customer);

                // Save both entities
                customerRepository.save(customer);
                offerRepository.save(offer);
                logger.info("Successfully removed offer from customer");
                return true;
            } else {
                logger.warning("Offer or customer not found");
                return false;
            }
        } catch (Exception e) {
            logger.severe("Error removing offer from customer: " + e.getMessage());
            e.printStackTrace();
            return false;
        }
    }
}
