package io.github.jihwankim97.industrialdataserver.alarm.service;

import io.github.jihwankim97.industrialdataserver.ingestion.event.TelemetryIngestedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;

@Service
public class
AlarmServiceImpl implements AlarmService{
    @Override
    public void checkAlarm(TelemetryIngestedEvent event) {

    }
}
