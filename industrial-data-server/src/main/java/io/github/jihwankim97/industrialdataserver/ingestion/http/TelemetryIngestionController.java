package io.github.jihwankim97.industrialdataserver.ingestion.http;

import io.github.jihwankim97.industrialdataserver.ingestion.dto.GatewayRefinedPayload;
import io.github.jihwankim97.industrialdataserver.ingestion.service.IngestionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/telemetry")
public class TelemetryIngestionController {
    private final IngestionService ingestionService;

    public TelemetryIngestionController(IngestionService ingestionService) {
        this.ingestionService = ingestionService;
    }

    @PostMapping("/ingest/gateway")
    public ResponseEntity<Void> ingestGateway(
            @RequestHeader("X-Site-Id") String siteId,
            @Valid @RequestBody GatewayRefinedPayload payload
            ){
        ingestionService.ingestGateway(siteId, payload);

        return ResponseEntity.accepted().build();
    }
}
