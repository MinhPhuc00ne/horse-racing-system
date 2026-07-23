package com.horseracing.controllers;

import com.horseracing.dto.request.CreateBreedRequest;
import com.horseracing.dto.response.BreedResponse;
import com.horseracing.services.BreedService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/breeds")
@RequiredArgsConstructor
public class BreedController {

    private final BreedService breedService;

    @GetMapping
    @PreAuthorize("hasAnyRole('HORSE_OWNER', 'ADMIN')")
    public ResponseEntity<List<BreedResponse>> getAllBreeds() {
        return ResponseEntity.ok(breedService.getAllBreeds());
    }

    @GetMapping("/official")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<BreedResponse>> getOfficialBreeds() {
        return ResponseEntity.ok(breedService.getOfficialBreeds());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('HORSE_OWNER', 'ADMIN')")
    public ResponseEntity<BreedResponse> createBreed(@Valid @RequestBody CreateBreedRequest request,
            Authentication authentication) {
        boolean isOfficial = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return ResponseEntity.ok(breedService.createBreed(request, isOfficial));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBreed(@PathVariable Integer id) {
        breedService.deleteBreed(id);
        return ResponseEntity.noContent().build();
    }
}
