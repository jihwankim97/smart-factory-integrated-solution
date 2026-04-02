package io.github.jihwankim97.industrialdataserver.master.domain;

import jakarta.persistence.*;
import lombok.EqualsAndHashCode;
import lombok.Getter;


@Entity
@Table(name = "master_site")
@Getter
@EqualsAndHashCode(of = "id")
public class MasterSite {

    @Id
    @Column(name = "site_id", nullable = false, length = 40)
    private String id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, length = 64)
    private String timezone;

    @Column(nullable = false)
    private boolean active;



    protected MasterSite() {
    }


    public MasterSite(String id, String name, String timezone, boolean active) {
        this.id = id;
        this.name = name;
        this.timezone = timezone;
        this.active = active;
    }
}
