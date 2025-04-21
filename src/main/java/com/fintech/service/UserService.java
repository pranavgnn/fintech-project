package com.fintech.service;

import com.fintech.dto.SignupRequest;
import com.fintech.dto.response.UserResponse;
import com.fintech.dto.response.UserSummaryResponse;
import com.fintech.entity.RoleType;

import java.util.List;

public interface UserService {
    UserResponse createUser(SignupRequest request);

    UserResponse getUserById(Long id);

    List<UserSummaryResponse> getAllUsers();

    void addRoleToUser(Long userId, RoleType roleType);

    boolean hasRole(Long userId, RoleType roleType);

    UserResponse getUserByEmail(String email);
}