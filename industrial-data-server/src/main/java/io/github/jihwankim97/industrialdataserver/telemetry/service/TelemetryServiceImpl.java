package io.github.jihwankim97.industrialdataserver.telemetry.service;

import io.github.jihwankim97.industrialdataserver.ingestion.event.TelemetryIngestedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class TelemetryServiceImpl implements TelemetryService{
    @Override
    public void saveTelemetry(TelemetryIngestedEvent event) {

    }
}
