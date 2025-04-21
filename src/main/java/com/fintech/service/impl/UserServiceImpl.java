package com.fintech.service.impl;

import com.fintech.dto.SignupRequest;
import com.fintech.dto.response.*;
import com.fintech.entity.*;
import com.fintech.exception.BadRequestException;
import com.fintech.exception.ResourceNotFoundException;
import com.fintech.repository.RoleRepository;
import com.fintech.repository.UserRepository;
import com.fintech.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public UserResponse createUser(SignupRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }
        if (userRepository.existsByPhoneNumber(request.getPhoneNumber())) {
            throw new BadRequestException("Phone number already in use");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());

        // Set default role
        Role userRole = roleRepository.findByName(RoleType.ROLE_USER)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        user.getRoles().add(userRole);

        // Create KYC if provided
        if (request.getKyc() != null) {
            KYC kyc = new KYC();
            kyc.setDateOfBirth(request.getKyc().getDateOfBirth());
            kyc.setAadhaarNumber(request.getKyc().getAadhaarNumber());
            kyc.setPanNumber(request.getKyc().getPanNumber());

            // Create Address if provided
            if (request.getKyc().getAddress() != null) {
                Address address = new Address();
                address.setLine1(request.getKyc().getAddress().getLine1());
                address.setLine2(request.getKyc().getAddress().getLine2());
                address.setStreet(request.getKyc().getAddress().getStreet());
                address.setCity(request.getKyc().getAddress().getCity());
                address.setState(request.getKyc().getAddress().getState());
                address.setCountry(request.getKyc().getAddress().getCountry());
                address.setZipCode(request.getKyc().getAddress().getZipCode());
                kyc.setAddress(address);
            }
            user.setKyc(kyc);
        }

        User savedUser = userRepository.save(user);
        return convertToUserResponse(savedUser);
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return convertToUserResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserSummaryResponse> getAllUsers() {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::convertToUserSummaryResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void addRoleToUser(Long userId, RoleType roleType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Role role = roleRepository.findByName(roleType)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        user.getRoles().add(role);
        userRepository.save(user);
    }

    @Override
    public boolean hasRole(Long userId, RoleType roleType) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return user.getRoles().stream()
                .anyMatch(role -> role.getName() == roleType);
    }

    @Override
    public UserResponse getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return convertToUserResponse(user);
    }

    private UserResponse convertToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());

        // Convert KYC
        if (user.getKyc() != null) {
            KYCResponse kycResponse = new KYCResponse();
            kycResponse.setId(user.getKyc().getId());
            kycResponse.setDateOfBirth(user.getKyc().getDateOfBirth());
            kycResponse.setAadhaarNumber(user.getKyc().getAadhaarNumber());
            kycResponse.setPanNumber(user.getKyc().getPanNumber());

            // Convert Address
            if (user.getKyc().getAddress() != null) {
                AddressResponse addressResponse = new AddressResponse();
                addressResponse.setId(user.getKyc().getAddress().getId());
                addressResponse.setLine1(user.getKyc().getAddress().getLine1());
                addressResponse.setLine2(user.getKyc().getAddress().getLine2());
                addressResponse.setStreet(user.getKyc().getAddress().getStreet());
                addressResponse.setCity(user.getKyc().getAddress().getCity());
                addressResponse.setState(user.getKyc().getAddress().getState());
                addressResponse.setCountry(user.getKyc().getAddress().getCountry());
                addressResponse.setZipCode(user.getKyc().getAddress().getZipCode());
                kycResponse.setAddress(addressResponse);
            }
            response.setKyc(kycResponse);
        }

        // Convert Accounts (safely handling nulls)
        Set<AccountResponse> accounts = new HashSet<>();
        if (user.getAccounts() != null) {
            accounts = user.getAccounts().stream()
                    .map(account -> {
                        AccountResponse accountResponse = new AccountResponse();
                        accountResponse.setId(account.getId());
                        accountResponse.setAccountNumber(account.getAccountNumber());
                        accountResponse.setBalance(account.getBalance());
                        accountResponse.setType(account.getType());
                        return accountResponse;
                    })
                    .collect(Collectors.toSet());
        }
        response.setAccounts(accounts);

        // Convert Roles (safely handling nulls)
        Set<String> roles = new HashSet<>();
        if (user.getRoles() != null) {
            roles = user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toSet());
        }
        response.setRoles(roles);

        // Initialize offers as empty set since the field may not exist yet
        response.setOffers(new HashSet<>());

        return response;
    }

    private UserSummaryResponse convertToUserSummaryResponse(User user) {
        UserSummaryResponse response = new UserSummaryResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhoneNumber(user.getPhoneNumber());

        // Explicitly load roles to avoid lazy loading issues
        Set<String> roleNames = new HashSet<>();
        if (user.getRoles() != null) {
            roleNames = user.getRoles().stream()
                    .map(role -> role.getName().name())
                    .collect(Collectors.toSet());
        }
        response.setRoles(roleNames);

        return response;
    }
}