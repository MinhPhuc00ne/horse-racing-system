package com.horseracing.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateConditionsRequest {
    private String weather;
    private String trackCondition; // Maps to surfaceType in Race
}
