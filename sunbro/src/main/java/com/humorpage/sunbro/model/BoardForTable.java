package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.hibernate.annotations.Formula;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;

@Entity
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name="board")
public class BoardForTable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name="author_num")
    private Long authorNum;

    @NotBlank
    @Column(name="title")
    private String title;

    @Formula("(select count(*) from boardlikes bl where bl.board_id=id)")
    private int total_likes_num;

    //depth 0이상인 댓글은 thumbnail에 표시용
    @Formula("(select count(*) from comment c where c.board_id=id)")
    private int total_comments_num;
}
