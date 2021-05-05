package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonFilter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import lombok.EqualsAndHashCode;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
import org.springframework.format.annotation.DateTimeFormat;


import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.LocalDateTime;

@EqualsAndHashCode(callSuper = false)
@Entity
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name="board")
public class BoardDetail implements Serializable{

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

    @Column(name = "thumbnail")
    private String thumbnail;

    @Column(name = "created",insertable = false)
    private LocalDateTime created;

    @Column(name = "more")
    private boolean more;

    @Column(name = "media_dir")
    private String mediaDir;

    @Column(name = "author_num")
    private Long authorNum;

    @Column(name = "author_name")
    private String authorName;

    @Column(name = "author_img")
    private String authorImg;

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
