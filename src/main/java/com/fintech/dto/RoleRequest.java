package com.fintech.dto;

import com.fintech.entity.RoleType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleRequest {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Role type is required")
    private RoleType roleType;
}