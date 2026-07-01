package com.horseracing.dto.response;

import com.horseracing.entities.Race;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefereeRaceResponse {
    private Integer raceId;
    private Integer tournamentId;
    private String raceName;
    private String tournamentName;
    private LocalDate raceDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private String status;
    private Double distance;
    private String surfaceType;
    private String venue;
    private String trackShape;
    private String weather;

    public static RefereeRaceResponse fromEntity(Race r) {
        if (r == null) return null;
        return RefereeRaceResponse.builder()
                .raceId(r.getId())
                .tournamentId(r.getTournament().getId())
                .raceName(r.getRaceName())
                .tournamentName(r.getTournament().getTournamentName())
                .raceDate(r.getRaceDate())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .status(r.getStatus())
                .distance(r.getDistance())
                .surfaceType(r.getSurfaceType())
                .venue(r.getRaceTrack().getName())
                .trackShape(r.getRaceTrack().getShape())
                .weather(r.getWeather())
                .build();
    }
}
