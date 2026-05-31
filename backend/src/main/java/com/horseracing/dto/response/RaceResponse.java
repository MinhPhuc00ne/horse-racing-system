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
public class RaceResponse {
    private Integer id;
    private String raceName;
    private Integer tournamentId;
    private String tournamentName;
    private Integer raceTrackId;
    private String raceTrackName;
    private LocalDate raceDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer raceRound;
    private Integer maxHorses;
    private Double distance;
    private String surfaceType;
    private String weather;
    private String status;

    public static RaceResponse fromEntity(Race r) {
        if (r == null) return null;
        return RaceResponse.builder()
                .id(r.getId())
                .raceName(r.getRaceName())
                .tournamentId(r.getTournament().getId())
                .tournamentName(r.getTournament().getTournamentName())
                .raceTrackId(r.getRaceTrack().getId())
                .raceTrackName(r.getRaceTrack().getName())
                .raceDate(r.getRaceDate())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .raceRound(r.getRaceRound())
                .maxHorses(r.getMaxHorses())
                .distance(r.getDistance())
                .surfaceType(r.getSurfaceType())
                .weather(r.getWeather())
                .status(r.getStatus())
                .build();
    }
}
