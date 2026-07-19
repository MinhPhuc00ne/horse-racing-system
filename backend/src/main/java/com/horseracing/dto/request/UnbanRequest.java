package com.horseracing.dto.request;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UnbanRequest {
    private String reason;
}
