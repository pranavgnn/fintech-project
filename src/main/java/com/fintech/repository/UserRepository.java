package com.fintech.repository;

import com.fintech.entity.User;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhoneNumber(String phoneNumber);

    @EntityGraph(attributePaths = { "roles" })
    @NonNull
    List<User> findAll();

    @EntityGraph(attributePaths = { "roles" })
    @NonNull
    Optional<User> findById(@NonNull Long id);
}