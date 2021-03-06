package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import org.hibernate.annotations.Formula;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.io.Serializable;

@Entity
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name="board")
public class BoardForTable implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name="author_num")
    private Long authorNum;

    @NotBlank
    @Column(name="title")
    private String title;

    @Column(name="likes")
    private int likes;

    @Column(name="comments_cnt")
    private int comments_cnt;
}
