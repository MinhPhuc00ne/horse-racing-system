package com.horseracing.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateBreedRequest {

    @NotBlank(message = "Breed name is required")
    private String breedName;
}
