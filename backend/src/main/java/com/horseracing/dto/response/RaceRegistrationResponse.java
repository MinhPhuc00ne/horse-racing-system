package com.horseracing.dto.response;

import com.horseracing.entities.RaceRegistration;
import lombok.*;

import java.time.LocalDateTime;
import java.time.LocalDate;
import java.time.LocalTime;
import java.math.BigDecimal;

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

    // Added fields for Jockey invitations page
    private String tournamentName;
    private String stableName;
    private String horseBreed;
    private LocalDate raceDate;
    private LocalTime startTime;
    private String location;
    private BigDecimal totalPrize;

    public static RaceRegistrationResponse fromEntity(RaceRegistration rr) {
        if (rr == null)
            return null;
        return RaceRegistrationResponse.builder().id(rr.getId()).raceId(rr.getRace().getId())
                .raceName(rr.getRace().getRaceName()).horseId(rr.getHorse().getId())
                .horseName(rr.getHorse().getName()).jockeyId(rr.getJockey().getId())
                .jockeyName(rr.getJockey().getUser().getFullName()).ownerId(rr.getOwner().getId())
                .ownerName(rr.getOwner().getUser().getFullName()).status(rr.getStatus())
                .ownerSharePercent(rr.getOwnerSharePercent())
                .jockeySharePercent(rr.getJockeySharePercent()).createdAt(rr.getCreatedAt())
                .tournamentName(rr.getRace().getTournament() != null
                        ? rr.getRace().getTournament().getTournamentName()
                        : null)
                .stableName(rr.getOwner() != null ? rr.getOwner().getStableName() : null)
                .horseBreed(rr.getHorse() != null && rr.getHorse().getBreed() != null
                        ? rr.getHorse().getBreed().getBreedName()
                        : null)
                .raceDate(rr.getRace() != null ? rr.getRace().getRaceDate() : null)
                .startTime(rr.getRace() != null ? rr.getRace().getStartTime() : null)
                .location(rr.getRace() != null && rr.getRace().getRaceTrack() != null
                        ? rr.getRace().getRaceTrack().getName()
                        : (rr.getRace() != null && rr.getRace().getTournament() != null
                                ? rr.getRace().getTournament().getLocation()
                                : null))
                .totalPrize(rr.getRace() != null && rr.getRace().getTournament() != null
                        ? rr.getRace().getTournament().getTotalPrize()
                        : null)
                .build();
    }
}
