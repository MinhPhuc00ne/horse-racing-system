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
    private String trackShape;

    private Integer refereeId;
    private String refereeName;

    public static RaceResponse fromEntity(Race r) {
        if (r == null) return null;
        return RaceResponse.builder()
                .id(r.getId())
                .raceName(r.getRaceName())
                .tournamentId(r.getTournament() != null ? r.getTournament().getId() : null)
                .tournamentName(r.getTournament() != null ? r.getTournament().getTournamentName() : null)
                .raceTrackId(r.getRaceTrack() != null ? r.getRaceTrack().getId() : null)
                .raceTrackName(r.getRaceTrack() != null ? r.getRaceTrack().getName() : null)
                .raceDate(r.getRaceDate())
                .startTime(r.getStartTime())
                .endTime(r.getEndTime())
                .raceRound(r.getRaceRound())
                .maxHorses(r.getMaxHorses())
                .distance(r.getDistance())
                .surfaceType(r.getSurfaceType())
                .weather(r.getWeather())
                .status(r.getStatus())
                .trackShape(r.getRaceTrack() != null ? r.getRaceTrack().getShape() : null)
                .refereeId(r.getReferee() != null ? r.getReferee().getId() : null)
                .refereeName(r.getReferee() != null ? r.getReferee().getFullName() : null)
                .build();
    }
}
