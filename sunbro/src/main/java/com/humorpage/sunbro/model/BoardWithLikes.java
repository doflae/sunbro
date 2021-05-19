package com.humorpage.sunbro.model;


import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
@Table(name="board")
public class BoardWithLikes {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name="id")
    private Long id;

    @Column(name = "created",insertable = false)
    private LocalDateTime created;

    @Column(name="likes")
    private int likes;
}
