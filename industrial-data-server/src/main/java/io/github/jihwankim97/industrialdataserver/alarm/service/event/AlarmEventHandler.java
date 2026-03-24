package io.github.jihwankim97.industrialdataserver.alarm.service.event;

import io.github.jihwankim97.industrialdataserver.alarm.service.AlarmService;
import io.github.jihwankim97.industrialdataserver.ingestion.event.TelemetryIngestedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Component;

@Component
public class AlarmEventHandler {
    private final AlarmService alarmService;

    public AlarmEventHandler(AlarmService alarmService) {
        this.alarmService = alarmService;
    }

    @EventListener
    public void onTelemetryIngested(TelemetryIngestedEvent event) {
        alarmService.checkAlarm(event);
    }
}
