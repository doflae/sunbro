package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;
import lombok.RequiredArgsConstructor;

import javax.persistence.*;
import java.io.Serializable;

@RequiredArgsConstructor
@Entity
@Data
@Table(name="commentlikes")
public class Commentlikes {

    @Id
    @Column(name="id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="comment_id")
    final private Long commentId;

    @Column(name="user_num")
    final private Long userNum;
}
