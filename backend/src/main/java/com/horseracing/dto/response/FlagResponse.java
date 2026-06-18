package com.horseracing.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlagResponse {
    private Integer flagId;
    private Integer horseId;
    private Long totalFlags;
    private Integer penaltySeconds;
    private Boolean isDisqualified;
}
