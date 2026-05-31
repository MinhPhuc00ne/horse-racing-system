package com.horseracing.dto.response;

import com.horseracing.entities.Horse;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HorseResponse {
    private Integer id;
    private String name;
    private Integer breedId;
    private String breedName;
    private Integer age;
    private String gender;
    private String color;
    private String trainingStatus;
    private String healthStatus;
    private Double speedRating;
    private String status;

    public static HorseResponse fromEntity(Horse h) {
        if (h == null) return null;
        return HorseResponse.builder()
                .id(h.getId())
                .name(h.getName())
                .breedId(h.getBreed().getId())
                .breedName(h.getBreed().getBreedName())
                .age(h.getAge())
                .gender(h.getGender())
                .color(h.getColor())
                .trainingStatus(h.getTrainingStatus())
                .healthStatus(h.getHealthStatus())
                .speedRating(h.getSpeedRating())
                .status(h.getStatus())
                .build();
    }
}
