package com.project.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;

import java.time.LocalDate;
import java.util.HashSet;
import java.util.Set;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "offers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(exclude = { "customers" })
@ToString(exclude = { "customers" })
@JsonIgnoreProperties(ignoreUnknown = true)
public class Offer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String offerType;
    private String description;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate validTill;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate createdAt;

    @ManyToMany(mappedBy = "offers")
    @JsonIgnoreProperties("offers")
    private Set<Customer> customers = new HashSet<>();
}
