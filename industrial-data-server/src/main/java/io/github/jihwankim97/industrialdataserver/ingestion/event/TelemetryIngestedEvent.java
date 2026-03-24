package io.github.jihwankim97.industrialdataserver.ingestion.event;

import io.github.jihwankim97.industrialdataserver.ingestion.dto.GatewayStatus;

import java.time.Instant;
import java.util.Map;

public record TelemetryIngestedEvent(
        String siteId,
        String deviceId,
        Map<String, Double> metrics,
        GatewayStatus status,
        Instant collectedAt
) {
}
