package io.github.jihwankim97.industrialdataserver.alarm.service;

import io.github.jihwankim97.industrialdataserver.ingestion.event.TelemetryIngestedEvent;

public interface AlarmService {
    public void checkAlarm(TelemetryIngestedEvent event);
}
