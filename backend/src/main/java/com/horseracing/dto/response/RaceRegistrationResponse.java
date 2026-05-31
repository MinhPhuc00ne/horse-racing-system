package com.horseracing.dto.response;

import com.horseracing.entities.RaceRegistration;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RaceRegistrationResponse {
    private Integer id;
    private Integer raceId;
    private String raceName;
    private Integer horseId;
    private String horseName;
    private Integer jockeyId;
    private String jockeyName;
    private Integer ownerId;
    private String ownerName;
    private String status;
    private Double ownerSharePercent;
    private Double jockeySharePercent;
    private LocalDateTime createdAt;

    public static RaceRegistrationResponse fromEntity(RaceRegistration rr) {
        if (rr == null) return null;
        return RaceRegistrationResponse.builder()
                .id(rr.getId())
                .raceId(rr.getRace().getId())
                .raceName(rr.getRace().getRaceName())
                .horseId(rr.getHorse().getId())
                .horseName(rr.getHorse().getName())
                .jockeyId(rr.getJockey().getId())
                .jockeyName(rr.getJockey().getUser().getFullName())
                .ownerId(rr.getOwner().getId())
                .ownerName(rr.getOwner().getUser().getFullName())
                .status(rr.getStatus())
                .ownerSharePercent(rr.getOwnerSharePercent())
                .jockeySharePercent(rr.getJockeySharePercent())
                .createdAt(rr.getCreatedAt())
                .build();
    }
}
