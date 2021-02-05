package com.humorpage.sunbro.model;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Data
@Table(name="commentlikes")
public class Commentlikes implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @ManyToOne
    @JoinColumn(name="comment_id")
    private Comment comment;

    @ManyToOne
    @JoinColumn(name="user_id")
    private User user;
}
