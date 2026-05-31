package com.horseracing.dto.response;

import com.horseracing.entities.RaceParticipant;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParticipantResponse {
    private Integer id;
    private Integer raceId;
    private Integer horseId;
    private String horseName;
    private Integer jockeyId;
    private String jockeyName;
    private Integer gateNumber;
    private String status;

    public static ParticipantResponse fromEntity(RaceParticipant rp) {
        if (rp == null) return null;
        return ParticipantResponse.builder()
                .id(rp.getId())
                .raceId(rp.getRace().getId())
                .horseId(rp.getHorse().getId())
                .horseName(rp.getHorse().getName())
                .jockeyId(rp.getJockey().getId())
                .jockeyName(rp.getJockey().getUser().getFullName())
                .gateNumber(rp.getGateNumber())
                .status(rp.getStatus())
                .build();
    }
}
