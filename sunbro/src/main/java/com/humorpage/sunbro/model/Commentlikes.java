package com.humorpage.sunbro.model;

import lombok.Data;

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.Table;

@Entity
@Data
@Table(name="commentlikes")
public class Commentlikes {


    @Column(name="comment_id")
    final private Long commentId;

    @Column(name="user_num")
    final private Long userNum;
}
