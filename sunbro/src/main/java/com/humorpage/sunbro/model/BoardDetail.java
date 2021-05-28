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
import java.util.List;

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

    @Version
    @Column(name="likes")
    private int likes;

    @Column(name="comments_cnt")
    private int comments_cnt;

    @Transient
    private boolean like;

    @Transient
    private List<Comment> comments;

}
