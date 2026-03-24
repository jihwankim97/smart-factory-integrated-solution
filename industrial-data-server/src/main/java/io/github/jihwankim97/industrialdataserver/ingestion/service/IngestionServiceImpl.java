package io.github.jihwankim97.industrialdataserver.ingestion.service;

import io.github.jihwankim97.industrialdataserver.common.idempotency.IdempotencyService;
import io.github.jihwankim97.industrialdataserver.ingestion.dto.GatewayRefinedPayload;
import io.github.jihwankim97.industrialdataserver.ingestion.event.TelemetryIngestedEvent;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;

@Service
public class IngestionServiceImpl implements IngestionService {

    private final ApplicationEventPublisher eventPublisher;
    private final IdempotencyService idempotencyService;

    public IngestionServiceImpl(ApplicationEventPublisher eventPublisher, IdempotencyService idempotencyService) {
        this.eventPublisher = eventPublisher;
        this.idempotencyService = idempotencyService;
    }

    @Override
    public void ingestGateway(String siteId, GatewayRefinedPayload payload) {
        TelemetryIngestedEvent event = new TelemetryIngestedEvent(
                siteId,
                payload.deviceId(),
                payload.metrics(),
                payload.status(),
                payload.collectedAt()
        );

        String key = siteId + ":" + payload.deviceId()+":"+payload.collectedAt();
        if(idempotencyService.isDuplicate(key)){
            return;
        }

        eventPublisher.publishEvent(event);
    }
}
