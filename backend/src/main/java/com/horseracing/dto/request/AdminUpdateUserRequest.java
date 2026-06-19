package com.horseracing.dto.request;

import com.horseracing.entities.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminUpdateUserRequest {
    private String fullName;
    private String phone;
    private String avatarUrl;
    private Role role;
    private Boolean enabled;
    private String password;
}
