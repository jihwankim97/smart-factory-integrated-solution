package io.github.jihwankim97.industrialdataserver.telemetry.domain;

import io.github.jihwankim97.industrialdataserver.master.domain.MasterAsset;
import io.github.jihwankim97.industrialdataserver.master.domain.MasterSite;
import io.github.jihwankim97.industrialdataserver.master.domain.MasterTag;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(
        name = "telemetry_point",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_telemetry_site_tag_time", columnNames = {"site_id", "tag_key", "collected_at"})
        },
        indexes = {
                @Index(name = "idx_telemetry_site_tag_time_desc", columnList = "site_id,tag_key,collected_at"),
                @Index(name = "idx_telemetry_collected_at", columnList = "collected_at")
        }
)
@Getter
@EqualsAndHashCode(of = "id")
public class TelemetryPoint {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "telemetry_point_id", nullable = false)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private MasterSite site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "asset_id")
    private MasterAsset asset;

    @Column(name = "device_id", length = 40)
    private String deviceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id")
    private MasterTag tag;

    @Column(name = "tag_key", nullable = false, length = 120)
    private String tagKey;

    @Enumerated(EnumType.STRING)
    @Column(name = "value_type", nullable = false, length = 20)
    private TelemetryValueType valueType;

    @Column(name = "value_double", precision = 18, scale = 6)
    private BigDecimal valueDouble;

    @Column(name = "value_bool")
    private Boolean valueBool;

    @Column(name = "value_text", length = 255)
    private String valueText;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TelemetryStatus status;

    @Column(name = "collected_at", nullable = false)
    private Instant collectedAt;

    @Column(name = "ingested_at", nullable = false)
    private Instant ingestedAt;

    protected TelemetryPoint() {
    }

    public TelemetryPoint(
            MasterSite site,
            MasterAsset asset,
            String deviceId,
            MasterTag tag,
            String tagKey,
            TelemetryValueType valueType,
            BigDecimal valueDouble,
            Boolean valueBool,
            String valueText,
            TelemetryStatus status,
            Instant collectedAt,
            Instant ingestedAt
    ) {
        this.site = site;
        this.asset = asset;
        this.deviceId = deviceId;
        this.tag = tag;
        this.tagKey = tagKey;
        this.valueType = valueType;
        this.valueDouble = valueDouble;
        this.valueBool = valueBool;
        this.valueText = valueText;
        this.status = status;
        this.collectedAt = collectedAt;
        this.ingestedAt = ingestedAt;
    }
}
