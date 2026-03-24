package io.github.jihwankim97.industrialdataserver.ingestion.dto;



import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;

import java.time.Instant;
import java.util.Map;

public record GatewayRefinedPayload(
    @NotBlank String deviceId,
    @NotEmpty Map<String, Double> metrics,
    @NotNull GatewayStatus status,
    @NotNull Instant collectedAt
){}
