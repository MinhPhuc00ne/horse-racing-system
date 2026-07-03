package com.horseracing.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ViolationResponse {
    private Integer id;
    private String date; // Format: yyyy-MM-dd
    private String raceName;
    private String horseName;
    private String jockeyName;
    private String violationType;
    private String status; // FLAGGED, BLACKLISTED
}
