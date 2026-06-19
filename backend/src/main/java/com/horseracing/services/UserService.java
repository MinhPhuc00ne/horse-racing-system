package com.horseracing.services;

import com.horseracing.dto.request.AdminCreateUserRequest;
import com.horseracing.dto.request.AdminUpdateUserRequest;
import com.horseracing.dto.response.UserResponse;
import com.horseracing.entities.HorseOwnerProfile;
import com.horseracing.entities.JockeyProfile;
import com.horseracing.entities.User;
import com.horseracing.entities.enums.AuthProvider;
import com.horseracing.entities.enums.Role;
import com.horseracing.repositories.HorseOwnerProfileRepository;
import com.horseracing.repositories.JockeyProfileRepository;
import com.horseracing.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final HorseOwnerProfileRepository horseOwnerProfileRepository;
    private final JockeyProfileRepository jockeyProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers(String search, Role role, Boolean enabled) {
        return userRepository.findAll().stream()
                .filter(user -> role == null || user.getRole() == role)
                .filter(user -> enabled == null || user.isEnabled() == enabled)
                .filter(user -> search == null || search.isBlank() || 
                        (user.getFullName() != null && user.getFullName().toLowerCase().contains(search.toLowerCase())) ||
                        (user.getEmail() != null && user.getEmail().toLowerCase().contains(search.toLowerCase())) ||
                        (user.getUsername() != null && user.getUsername().toLowerCase().contains(search.toLowerCase())))
                .map(UserResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserResponse getUserById(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse createUser(AdminCreateUserRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already registered");
        }

        Role role = request.getRole() != null ? request.getRole() : Role.SPECTATOR;
        boolean enabled = request.getEnabled() == null || request.getEnabled();

        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .fullName(request.getFullName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phone(request.getPhone())
                .avatarUrl(request.getAvatarUrl())
                .role(role)
                .provider(AuthProvider.LOCAL)
                .enabled(enabled)
                .build();

        user = userRepository.save(user);

        // Auto-create role profiles if necessary
        createRoleProfileIfMissing(user, role);

        return UserResponse.fromEntity(user);
    }

    @Transactional
    public UserResponse updateUser(Integer id, AdminUpdateUserRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        if (request.getFullName() != null) user.setFullName(request.getFullName());
        if (request.getPhone() != null) user.setPhone(request.getPhone());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getEnabled() != null) user.setEnabled(request.getEnabled());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Role oldRole = user.getRole();
        if (request.getRole() != null && request.getRole() != oldRole) {
            user.setRole(request.getRole());
            createRoleProfileIfMissing(user, request.getRole());
        }

        user = userRepository.save(user);
        return UserResponse.fromEntity(user);
    }

    @Transactional
    public void deleteUser(Integer id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with ID: " + id));

        try {
            // Delete associated profiles first to avoid simple FK violations
            horseOwnerProfileRepository.findByUserEmail(user.getEmail()).ifPresent(horseOwnerProfileRepository::delete);
            jockeyProfileRepository.findByUserEmail(user.getEmail()).ifPresent(jockeyProfileRepository::delete);
            userRepository.delete(user);
        } catch (Exception e) {
            throw new RuntimeException("Cannot delete user because they have active transactional data (bets, races, etc.). Consider deactivating/disabling the user instead.");
        }
    }

    private void createRoleProfileIfMissing(User user, Role role) {
        if (role == Role.HORSE_OWNER) {
            if (horseOwnerProfileRepository.findByUserEmail(user.getEmail()).isEmpty()) {
                HorseOwnerProfile ownerProfile = HorseOwnerProfile.builder()
                        .user(user)
                        .phone(user.getPhone())
                        .reputationStars(5.0)
                        .approvalStatus("APPROVED")
                        .build();
                horseOwnerProfileRepository.save(ownerProfile);
            }
        } else if (role == Role.JOCKEY) {
            if (jockeyProfileRepository.findByUserEmail(user.getEmail()).isEmpty()) {
                JockeyProfile jockeyProfile = JockeyProfile.builder()
                        .user(user)
                        .winRate(0.0)
                        .experienceYear(0)
                        .rankingScore(0)
                        .approvalStatus("APPROVED")
                        .build();
                jockeyProfileRepository.save(jockeyProfile);
            }
        }
    }
}
