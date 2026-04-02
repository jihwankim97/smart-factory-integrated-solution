package io.github.jihwankim97.industrialdataserver.alarm.domain;

import io.github.jihwankim97.industrialdataserver.master.domain.MasterSite;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;

import java.math.BigDecimal;

@Entity
@Table(name = "alarm_rule")
@Getter
@EqualsAndHashCode(of = "id")
public class AlarmRule {

    @Id
    @Column(name = "rule_id",nullable = false, length = 40)
    private  String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private MasterSite site;

    @Column(name = "target_tag_key",nullable = false, length = 40)
    private String targetTagKey;

    @Column(nullable = false, length = 20)
    private String operator;

    @Column(nullable = false)
    private BigDecimal threshold;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity;

    @Column(nullable = false)
    private boolean enabled;


    protected AlarmRule() {
    }


    public AlarmRule(String id, MasterSite site, String targetTagKey, String operator, BigDecimal threshold, Severity severity, boolean enabled) {
        this.id = id;
        this.site = site;
        this.targetTagKey = targetTagKey;
        this.operator = operator;
        this.threshold = threshold;
        this.severity = severity;
        this.enabled = enabled;
    }
}
