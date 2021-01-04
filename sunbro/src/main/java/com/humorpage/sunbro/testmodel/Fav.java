/*
package com.humorpage.sunbro.testmodel;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.humorpage.sunbro.model.audit.DateAudit;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name="fav")
public class Fav extends DateAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="fno")
    private Integer fno;

    private String title;

    private String username;

    private Integer nickname;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name="tid")
    private javax.sound.sampled.Port Port;

    public Fav(){

    }

    public Fav(String username, String title, Integer nickname){
        this.title = title;
        this.username=username;
        this.nickname = nickname;
    }
}
*/
