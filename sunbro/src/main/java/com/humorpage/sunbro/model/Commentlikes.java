package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Data
@Table(name="commentlikes")
public class Commentlikes implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name="comment_id")
    private Comment comment;


    @JsonBackReference
    @ManyToOne
    @JoinColumn(name="user_num")
    private UserSimple user;
}
