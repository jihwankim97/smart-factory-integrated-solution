package io.github.jihwankim97.industrialdataserver.ingestion.mqtt;

import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.integration.config.EnableIntegration;
import org.springframework.integration.dsl.IntegrationFlow;
import org.springframework.integration.mqtt.core.DefaultMqttPahoClientFactory;
import org.springframework.integration.mqtt.core.MqttPahoClientFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.integration.mqtt.inbound.MqttPahoMessageDrivenChannelAdapter;
import org.springframework.integration.mqtt.support.DefaultPahoMessageConverter;

@Configuration
@EnableIntegration
@ConditionalOnProperty(name = "app.mqtt.enabled", havingValue = "true", matchIfMissing = true)
public class MqttTelemetryInboundConfig {

    @Bean
    public MqttPahoClientFactory mqttClientFactory(@Value("${app.mqtt.broker-url}") String brokerUrl) {
        DefaultMqttPahoClientFactory factory = new DefaultMqttPahoClientFactory();
        MqttConnectOptions options = new MqttConnectOptions();
        options.setServerURIs(new String[]{brokerUrl});
        options.setAutomaticReconnect(true);
        factory.setConnectionOptions(options);
        return factory;
    }

    @Bean
    public MqttPahoMessageDrivenChannelAdapter mqttInboundAdapter(
            MqttPahoClientFactory mqttClientFactory,
            @Value("${app.mqtt.client-id}") String clientId,
            @Value("${app.mqtt.topics}") String topicsCsv
    ) {
        String[] topics = java.util.Arrays.stream(topicsCsv.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
        MqttPahoMessageDrivenChannelAdapter adapter =
                new MqttPahoMessageDrivenChannelAdapter(clientId, mqttClientFactory, topics);
        DefaultPahoMessageConverter messageConverter = new DefaultPahoMessageConverter();
        messageConverter.setPayloadAsBytes(false);
        adapter.setConverter(messageConverter);
        adapter.setCompletionTimeout(5_000);
        adapter.setQos(1);
        return adapter;
    }

    @Bean
    public IntegrationFlow mqttTelemetryFlow(
            MqttPahoMessageDrivenChannelAdapter mqttInboundAdapter,
            MqttTelemetryMessageHandler mqttTelemetryMessageHandler
    ) {
        return IntegrationFlow.from(mqttInboundAdapter)
                .handle(mqttTelemetryMessageHandler)
                .nullChannel();
    }
}
