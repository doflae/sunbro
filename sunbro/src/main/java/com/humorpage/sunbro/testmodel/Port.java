/*
package com.humorpage.sunbro.testmodel;


import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import com.humorpage.sunbro.model.audit.DateAudit;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;
import java.util.HashSet;
import java.util.Set;

@Getter
@Setter
@Entity
@Table(name = "port")
public class Port extends DateAudit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="tno")
    private Integer tno;

    private String title;

    private String content;

    @ManyToOne
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User testUser;

    @JsonManagedReference
    @OneToOne(fetch= FetchType.LAZY,
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            mappedBy = "port")
    private Thumbnail testThumbnail;



    @JsonManagedReference
    @OneToMany(fetch=FetchType.LAZY,
            cascade = CascadeType.ALL,
            mappedBy = "port")
    private Set<Fav> fav = new HashSet<>();

    public Port(){

    }

    public Port(String title, String content,User testUser){
        this.title = title;
        this.content = content;
        this.testUser = testUser;

    }
}
*/
