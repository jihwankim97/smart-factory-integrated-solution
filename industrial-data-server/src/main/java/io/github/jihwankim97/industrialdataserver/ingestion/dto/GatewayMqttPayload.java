package io.github.jihwankim97.industrialdataserver.ingestion.dto;

import java.time.Instant;
import java.util.Map;

public record GatewayMqttPayload(
        String deviceId,
        Map<String, Double> metrics,
        String status,
        String collectedAt
) {
    public GatewayMqttPayload {
        if (deviceId == null || deviceId.isBlank()) {
            throw new IllegalArgumentException("deviceId is mandatory");
        }
        if (metrics == null || metrics.isEmpty()) {
            throw new IllegalArgumentException("metrics must not be null or empty");
        }
        if (collectedAt == null || collectedAt.isBlank()) {
            collectedAt = Instant.now().toString();
        }
    }
}
