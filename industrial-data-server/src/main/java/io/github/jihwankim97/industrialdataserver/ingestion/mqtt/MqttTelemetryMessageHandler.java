package io.github.jihwankim97.industrialdataserver.ingestion.mqtt;

import tools.jackson.databind.json.JsonMapper;
import io.github.jihwankim97.industrialdataserver.ingestion.dto.GatewayMqttPayload;
import io.github.jihwankim97.industrialdataserver.ingestion.dto.GatewayStatus;
import io.github.jihwankim97.industrialdataserver.ingestion.event.TelemetryIngestedEvent;
import io.github.jihwankim97.industrialdataserver.telemetry.service.TelemetryService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.integration.core.GenericHandler;
import org.springframework.integration.mqtt.support.MqttHeaders;
import org.springframework.messaging.MessageHeaders;
import org.springframework.stereotype.Component;

import java.time.Instant;

@Component
class MqttTelemetryMessageHandler implements GenericHandler<String> {

    private static final Logger log = LoggerFactory.getLogger(MqttTelemetryMessageHandler.class);

    private final JsonMapper jsonMapper;
    private final TelemetryService telemetryService;
    private final String defaultSiteId;

    MqttTelemetryMessageHandler(
            JsonMapper jsonMapper,
            TelemetryService telemetryService,
            @Value("${app.ingestion.default-site-id}") String defaultSiteId
    ) {
        this.jsonMapper = jsonMapper;
        this.telemetryService = telemetryService;
        this.defaultSiteId = defaultSiteId;
    }

    @Override
    public Object handle(String payload, MessageHeaders headers) {
        String topic = headers.get(MqttHeaders.RECEIVED_TOPIC, String.class);
        if (payload == null || payload.isBlank()) {
            log.warn("Empty MQTT payload received, topic={}", topic);
            return null;
        }
        try {
            GatewayMqttPayload gatewayPayload = jsonMapper.readValue(payload, GatewayMqttPayload.class);
            GatewayStatus status = GatewayStatus.from(gatewayPayload.status());
            TelemetryIngestedEvent event = new TelemetryIngestedEvent(
                    defaultSiteId,
                    gatewayPayload.deviceId(),
                    gatewayPayload.metrics(),
                    status,
                    Instant.parse(gatewayPayload.collectedAt())
            );
            telemetryService.saveTelemetry(event);
        } catch (Exception e) {
            handleError(topic, payload, e);
        }
        return null;
    }

    private void handleError(String topic, String payload, Exception e) {
        String abbreviatedPayload = abbreviate(payload);

        IllegalArgumentException invalidPayload = firstIllegalArgumentExceptionInCauseChain(e);
        if (invalidPayload != null) {
            log.warn("Invalid MQTT telemetry payload topic={} payload={}: {}",
                    topic, abbreviatedPayload, invalidPayload.getMessage());
            return;
        }

        if (containsJsonMappingInCauseChain(e)) {
            log.warn("Malformed MQTT telemetry JSON topic={} payload={}",
                    topic, abbreviatedPayload, e);
            return;
        }

        log.error("Failed to handle MQTT telemetry topic={} payload={}", topic, abbreviatedPayload, e);
    }

    private static IllegalArgumentException firstIllegalArgumentExceptionInCauseChain(Throwable e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            if (t instanceof IllegalArgumentException iae) {
                return iae;
            }
        }
        return null;
    }

    private static boolean containsJsonMappingInCauseChain(Throwable e) {
        for (Throwable t = e; t != null; t = t.getCause()) {
            String className = t.getClass().getName();
            if (className.contains("Json") || className.contains("Jackson")) {
                return true;
            }
        }
        return false;
    }

    private static String abbreviate(String json) {
        if (json == null) {
            return "";
        }
        return json.length() > 500 ? json.substring(0, 500) + "..." : json;
    }
}
