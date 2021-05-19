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
    private Long parentId;

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

    @Column(name = "likes")
    private int likes;

    @Column(name = "children_cnt")
    private int children_cnt;

    @Transient
    private boolean like;

}