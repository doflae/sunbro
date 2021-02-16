package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Formula;
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
public class BoardThumbnail implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @NotBlank
    @Column(name="title")
    private String title;

    @NotBlank
    @Column(name="content")
    private String content;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_num")
    private UserSimple author;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created")
    @CreationTimestamp
    private LocalDateTime created;

//    @JsonManagedReference
//    @OneToMany(mappedBy = "boardThumbnail", fetch = FetchType.LAZY)
//    private List<Boardlikes> boardlikes = new ArrayList<>();

    private String thumbnail;

    @Formula("(select count(*) from boardlikes bl where bl.board_id=id)")
    private int likes;

    @Formula("(select count(*) from comment c where c.board_id=id)")
    private int comments_num;

    @Transient
    private boolean like;
}
