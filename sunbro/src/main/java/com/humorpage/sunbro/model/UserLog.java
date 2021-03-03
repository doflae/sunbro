package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.hibernate.annotations.Formula;

import javax.persistence.*;

@Entity
@Table(name="user")
@Data
public class UserLog {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    @Column(name = "usernum")
    private Long usernum;

    @Column(nullable = false, unique = true, length = 30)
    @JsonIgnore
    private String uid;

    @Column(name="name")
    private String name;

    @Column(name="profileImg")
    private String userImg;

    @Formula("(select count(*) from board b where b.author_num=usernum)")
    private int total_board_num;

    @Formula("(select count(*) from comment c where c.author_num=usernum)")
    private int total_comment_num;

    @Formula("(select count(*) from boardlikes bl where bl.user_num=usernum)")
    private int total_board_likes;
}
