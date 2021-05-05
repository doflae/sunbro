package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name="comment")
@JsonInclude(JsonInclude.Include.NON_EMPTY)
public class Comment implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "parent_id")
    @JsonIgnore
    private Long pid=null;

    @Column(name="content")
    private String content;

    @Column(name="media")
    private String media;

    @Column(name="board_id")
    @JsonIgnore
    private Long boardId;

    @Column(name = "author_num")
    private Long authorNum;

    @Column(name = "author_name")
    private String authorName;

    @Column(name = "author_img")
    private String authorImg;


    @Basic(fetch = FetchType.LAZY)
    @Formula("(select count(*) from commentlikes cl where cl.comment_id=id)")
    private int likes;

    @Transient
    private boolean like;

    @Basic(fetch = FetchType.LAZY)
    @Formula("(select count(*) from comment c where c.parent_id=id)")
    private int children_cnt;
}