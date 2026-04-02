package io.github.jihwankim97.industrialdataserver.alarm.domain;

import io.github.jihwankim97.industrialdataserver.master.domain.MasterSite;
import io.github.jihwankim97.industrialdataserver.master.domain.MasterTag;
import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Entity
@Table(name = "alarm_event")
@Getter
@EqualsAndHashCode(of = "id")
public class AlarmEvent {

    @Id
    @Column(name = "alarm_event_id", nullable = false, length = 40)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rule_id")
    private AlarmRule rule;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private MasterSite site;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "tag_id", nullable = false)
    private MasterTag tag;

    @Column(name = "triggered_value",nullable = false)
    private BigDecimal triggeredValue;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AlarmState state;

    @Column(name = "occurred_at",nullable = false)
    private Instant occurredAt;

    @Column(name = "cleared_at",nullable = true)
    private Instant clearedAt;


    protected AlarmEvent() {
    }

    public AlarmEvent(String id, AlarmRule rule, MasterSite site, MasterTag tag, BigDecimal triggeredValue, AlarmState state, Instant occurredAt) {
        this.id = id;
        this.rule = rule;
        this.site = site;
        this.tag = tag;
        this.triggeredValue = triggeredValue;
        this.state = state;
        this.occurredAt = occurredAt;
    }
}
