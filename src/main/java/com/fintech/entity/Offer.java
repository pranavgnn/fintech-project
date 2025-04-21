package com.fintech.entity;

import jakarta.persistence.*;
import lombok.Data;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Data
@Entity
@Table(name = "offers")
@EntityListeners(AuditingEntityListener.class)
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, length = 1000)
    private String description;

    private String category;

    @Column(nullable = false)
    private LocalDateTime validFrom;

    @Column(nullable = false, name = "valid_till")
    private LocalDateTime validUntil;

    private String discount;

    @Column(nullable = false)
    private Boolean active = true;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OfferTargetType targetType = OfferTargetType.ALL_USERS;

    private String targetCriteria;

    @ManyToMany(fetch = FetchType.EAGER) // Using EAGER fetch to prevent lazy loading issues
    @JoinTable(name = "offer_users", joinColumns = @JoinColumn(name = "offer_id"), inverseJoinColumns = @JoinColumn(name = "user_id"))
    private Set<User> targetUsers = new HashSet<>();

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    // Enum for offer target types
    public enum OfferTargetType {
        ALL_USERS,
        SELECTED_USERS,
        CRITERIA_BASED
    }

    // Add these methods to prevent circular reference issues in
    // toString/equals/hashCode
    @Override
    public String toString() {
        return "Offer{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", targetType=" + targetType +
                ", active=" + active +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o)
            return true;
        if (!(o instanceof Offer))
            return false;
        Offer offer = (Offer) o;
        return id != null && id.equals(offer.id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}