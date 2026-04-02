package io.github.jihwankim97.industrialdataserver.master.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Entity
@Table(name = "master_tag")
@Getter
@EqualsAndHashCode(of = "id")
public class MasterTag {


    @Id
    @Column(name = "tag_id",nullable = false, length = 40)
    private String  id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="asset_id", nullable = false)
    private MasterAsset asset;

    @Column(nullable = false, length = 100)
    private String code;

    @Column(name = "data_type",nullable = false, length = 40)
    private String dataType;

    @Column(nullable = false, length = 40)
    private String unit;

    @Column(nullable = false)
    private boolean active;


    protected MasterTag() {
    }


    public MasterTag(String id, MasterAsset asset, String code, String dataType, String unit, boolean active) {
        this.id = id;
        this.asset = asset;
        this.code = code;
        this.dataType = dataType;
        this.unit = unit;
        this.active = active;
    }
}
