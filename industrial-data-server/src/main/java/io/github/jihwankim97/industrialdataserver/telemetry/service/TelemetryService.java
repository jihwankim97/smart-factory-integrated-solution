package io.github.jihwankim97.industrialdataserver.telemetry.service;

import io.github.jihwankim97.industrialdataserver.ingestion.event.TelemetryIngestedEvent;

public interface TelemetryService {
    public void saveTelemetry(TelemetryIngestedEvent event);
}
