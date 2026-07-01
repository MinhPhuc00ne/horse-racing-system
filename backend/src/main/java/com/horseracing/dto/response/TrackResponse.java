package com.horseracing.dto.response;

import com.horseracing.entities.RaceTrack;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrackResponse {
    private Integer id;
    private String name;
    private String location;
    private String shape;

    public static TrackResponse fromEntity(RaceTrack track) {
        if (track == null) return null;
        return TrackResponse.builder()
                .id(track.getId())
                .name(track.getName())
                .location(track.getLocation())
                .shape(track.getShape())
                .build();
    }
}
