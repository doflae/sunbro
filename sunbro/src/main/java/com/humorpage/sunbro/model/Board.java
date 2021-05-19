package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.ReadOnlyProperty;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.LocalDateTime;

@Entity
@Data
@Table(name="board")
@JsonInclude(JsonInclude.Include.NON_NULL)
public class Board {

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
}
