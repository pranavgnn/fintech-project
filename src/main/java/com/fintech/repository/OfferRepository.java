package com.fintech.repository;

import com.fintech.entity.Offer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long> {
    List<Offer> findByValidFromBeforeAndValidTillAfter(LocalDateTime now, LocalDateTime now2);
}