package com.horseracing.dto.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PreCheckResponse {
    private Integer raceId;
    private String raceName;
    private String trackCondition;
    private String weather;
    private List<ParticipantPreCheck> participants;

    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ParticipantPreCheck {
        private Integer participantId;
        private Integer horseId;
        private String horseName;
        private Integer jockeyId;
        private String jockeyName;
        private Double registeredWeight;
        private Double actualWeight;
        private String status;
        private String horseImageUrl;
    }
}
