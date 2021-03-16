package com.humorpage.sunbro.model;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name="board")
public class BoardDetail {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long id;

    @NotBlank
    @Column(name = "title")
    private String title;

    @NotBlank
    @Column(name="content")
    private String content;

    @ManyToOne(fetch = FetchType.EAGER,optional = false)
    @JoinColumn(name = "author_num")
    private UserSimple author;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created")
    @CreationTimestamp
    private LocalDateTime created;

    @Formula("(select count(*) from boardlikes bl where bl.board_id=id)")
    private int likes;

    //depth 0이상인 댓글은 thumbnail에 표시용
    @Formula("(select count(*) from comment c where c.board_id=id)")
    private int total_comments_num;

    //depth 0인 댓글만 => 댓글 더보기 버튼 제어용
    @Formula("(select count(*) from comment c where c.board_id=id and c.parent_id=0)")
    private int comments_num;

    @Transient
    private boolean like;

}
