package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonFilter;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
import org.springframework.format.annotation.DateTimeFormat;


import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name="board")
public class BoardThumbnail implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @JsonIgnore
    @Column(name="author_num",insertable = false,updatable = false)
    private Long authorNum;

    @NotBlank
    @Column(name="title")
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

    @Column(name = "thumbnail")
    private String thumbnail;

    @Column(name = "thumbnailImg")
    private String thumbnailImg;

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

    //true->썸네일이 필요하다.
    //false->썸네일 필요없다.
    @Column(name = "more")
    private boolean more;

    @Column(name = "media_dir")
    private String mediaDir;

    public String getContent() {
        if(this.isMore()) return null;
        return content;
    }

    public String getThumbnail() {
        if(this.isMore()) return thumbnail;
        return null;
    }

    public String getThumbnailImg() {
        if(this.isMore()) return thumbnailImg;
        return null;
    }
}
