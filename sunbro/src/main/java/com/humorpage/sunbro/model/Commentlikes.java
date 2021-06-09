package com.humorpage.sunbro.model;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Data
@Table(name="commentlikes")
@IdClass(Commentlikes.class)
public class Commentlikes implements Serializable {

    @Id
    @Column(name="comment_id")
    final private Long commentId;

    @Id
    @Column(name="user_num")
    final private Long userNum;
}
