package io.github.jihwankim97.industrialdataserver.ingestion.service;

import io.github.jihwankim97.industrialdataserver.ingestion.dto.GatewayRefinedPayload;

public interface IngestionService {
    void ingestGateway(String siteId, GatewayRefinedPayload payload);
}
