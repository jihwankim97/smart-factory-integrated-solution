package io.github.jihwankim97.industrialdataserver.telemetry.event;

import io.github.jihwankim97.industrialdataserver.ingestion.event.TelemetryIngestedEvent;
import io.github.jihwankim97.industrialdataserver.telemetry.service.TelemetryService;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class TelemetryEventHandler {
    private final TelemetryService telemetryService;

    public TelemetryEventHandler(TelemetryService telemetryService) {
        this.telemetryService = telemetryService;
    }


    @EventListener
    public void onTelemetryIngested(TelemetryIngestedEvent event) {
        telemetryService.saveTelemetry(event);
    }
}