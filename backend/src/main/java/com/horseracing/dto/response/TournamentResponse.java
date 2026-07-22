package com.horseracing.dto.response;

import com.horseracing.entities.Tournament;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TournamentResponse {
    private Integer id;
    private String tournamentName;
    private String location;
    private String description;
    private LocalDateTime registrationDeadline;
    private Integer maxSlots;

    private BigDecimal totalPrize;
    private String tournamentStatus;
    private BigDecimal prizeFirst;
    private BigDecimal prizeSecond;
    private BigDecimal prizeThird;
    private BigDecimal minBetAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private String imageUrl;
    private Integer refereeId;
    private String refereeName;
    private BigDecimal entryFee;
    private Integer minSlots;
    private String allowedClasses;
    private String allowedAges;
    private String allowedGenders;
    private LocalDateTime registrationOpeningTime;
    private LocalDateTime officialRaceTime;
    private String surfaceType;
    private Double distance;


    public static TournamentResponse fromEntity(Tournament t) {
        if (t == null) return null;
        return TournamentResponse.builder()
                .id(t.getId())
                .tournamentName(t.getTournamentName())
                .location(t.getLocation())
                .description(t.getDescription())
                .registrationDeadline(t.getRegistrationDeadline())
                .maxSlots(t.getMaxSlots())

                .totalPrize(t.getTotalPrize())
                .tournamentStatus(t.getTournamentStatus())
                .prizeFirst(t.getPrizeFirst())
                .prizeSecond(t.getPrizeSecond())
                .prizeThird(t.getPrizeThird())
                .minBetAmount(t.getMinBetAmount())
                .imageUrl(t.getImageUrl())
                .refereeId(t.getReferee() != null ? t.getReferee().getId() : null)
                .refereeName(t.getReferee() != null ? t.getReferee().getFullName() : null)
                .entryFee(t.getEntryFee())
                .minSlots(t.getMinSlots())
                .allowedClasses(t.getAllowedClasses())
                .allowedAges(t.getAllowedAges())
                .allowedGenders(t.getAllowedGenders())
                .registrationOpeningTime(t.getRegistrationOpeningTime())
                .officialRaceTime(t.getOfficialRaceTime())
                .surfaceType(t.getSurfaceType())
                .distance(t.getDistance() != null ? t.getDistance() : 1200.0)
                .createdAt(t.getCreatedAt())

                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
