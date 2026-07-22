package com.horseracing.dto.response;

import com.horseracing.entities.User;
import com.horseracing.entities.enums.AuthProvider;
import com.horseracing.entities.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Integer id;
    private String username;
    private String email;
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Role role;
    private AuthProvider provider;
    private boolean enabled;
    private LocalDateTime createdAt;
    private String bankName;
    private String bankBin;
    private String bankAccountNumber;
    private String bankAccountHolderName;

    public static UserResponse fromEntity(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .phone(user.getPhone())
                .avatarUrl(user.getAvatarUrl())
                .role(user.getRole())
                .provider(user.getProvider())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .bankName(user.getBankName())
                .bankBin(user.getBankBin())
                .bankAccountNumber(user.getBankAccountNumber())
                .bankAccountHolderName(user.getBankAccountHolderName())
                .build();
    }
}
