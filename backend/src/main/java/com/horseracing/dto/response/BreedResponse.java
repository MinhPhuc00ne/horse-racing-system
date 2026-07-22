package com.horseracing.dto.response;

import com.horseracing.entities.HorseBreed;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BreedResponse {

    private Integer id;
    private String breedName;
    private Boolean isOfficial;

    public static BreedResponse fromEntity(HorseBreed breed) {
        return BreedResponse.builder().id(breed.getId()).breedName(breed.getBreedName())
                .isOfficial(breed.getIsOfficial()).build();
    }
}
