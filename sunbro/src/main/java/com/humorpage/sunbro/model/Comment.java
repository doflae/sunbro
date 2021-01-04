package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.humorpage.sunbro.model.Audit.DateAudit;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name="comment")
public class Comment extends DateAudit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name ="cno")
    private Integer cno;

    private String user;

    private String comment;

    @JsonBackReference
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="epi_id")
    private Board board;

    public Comment(){
    }

    public Comment(String user, String comment){
        this.user= user;
        this.comment = comment;
    }
}