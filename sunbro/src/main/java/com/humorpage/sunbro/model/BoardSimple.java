package com.humorpage.sunbro.model;

import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;

@Entity
@Data
@Table(name="board")
public class BoardSimple {
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

    @Column(name = "thumbnailImg")
    private String thumbnailImg;

    @Column(name = "media_dir")
    private String mediaDir;
}
