package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name="board")
public class Board implements Serializable {

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

    @Column(name = "thumbnailImg")
    private String thumbnailImg;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created")
    @CreationTimestamp
    private LocalDateTime created;

    @GeneratedValue
    @Column(name ="updated")
    private LocalDateTime updated;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_num")
    private UserSimple author;

    @Column(name = "more")
    private boolean more;

    @Column(name = "media_dir")
    private String mediaDir;
}
