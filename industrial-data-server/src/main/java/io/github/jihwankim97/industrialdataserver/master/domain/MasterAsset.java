package io.github.jihwankim97.industrialdataserver.master.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;

@Entity
@Table(name = "master_asset")
@Getter
@EqualsAndHashCode(of = "id")
public class MasterAsset {

    @Id
    @Column(name = "asset_id", nullable = false, length = 40)
    private String id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "site_id", nullable = false)
    private MasterSite site;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 20)
    private String type;

    @Column(nullable = false)
    private boolean active;

    protected MasterAsset() {
    }

    public MasterAsset(String id, MasterSite site, String name, String type, boolean active) {
        this.id = id;
        this.site = site;
        this.name = name;
        this.type = type;
        this.active = active;
    }

    public void rename(String newName){
        if(newName==null||newName.isBlank()){
            throw new IllegalArgumentException("name required");
        }
        this.name = newName.trim();
    }

    public void deactivate(){
        if(!this.active){
            throw new IllegalStateException("asset already inactive: " + id);
        }
        this.active=false;
    }

    public void activate(){
        this.active = true;
    }

    public boolean canAcceptTelemetry(){
        return active;
    }
}