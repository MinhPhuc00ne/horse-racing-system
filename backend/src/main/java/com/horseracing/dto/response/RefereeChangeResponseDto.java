package com.horseracing.dto.response;

import com.horseracing.entities.RefereeChangeRequest;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RefereeChangeResponseDto {
    private Integer id;
    private Integer refereeId;
    private String refereeName;
    private Integer tournamentId;
    private String tournamentName;
    private String reason;
    private String status;
    private LocalDateTime createdAt;

    public static RefereeChangeResponseDto fromEntity(RefereeChangeRequest req) {
        if (req == null) return null;
        return RefereeChangeResponseDto.builder()
                .id(req.getId())
                .refereeId(req.getReferee().getId())
                .refereeName(req.getReferee().getFullName())
                .tournamentId(req.getTournament().getId())
                .tournamentName(req.getTournament().getTournamentName())
                .reason(req.getReason())
                .status(req.getStatus())
                .createdAt(req.getCreatedAt())
                .build();
    }
}
