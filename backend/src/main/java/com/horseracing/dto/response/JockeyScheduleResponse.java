package com.horseracing.dto.response;

import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JockeyScheduleResponse {
    private Integer participantId;
    private Integer raceId;
    private String raceName;
    private LocalDate raceDate;
    private LocalTime startTime;
    private Integer horseId;
    private String horseName;
    private Integer gateNumber;
    private String participantStatus;
    private String raceStatus;
}
