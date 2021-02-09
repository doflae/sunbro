package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
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
public class Comment implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_num")
    private UserSimple author;

    @NotNull
    private String content;

    //JsonBackReference는 직렬화를 수행하지 않는 곳에 붙인다
    @JsonBackReference
    @ManyToOne
    @JoinColumn(name="board_id")
    private Board board;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created")
    @CreationTimestamp
    private LocalDateTime created;

    @GeneratedValue
    @Column(name ="updated")
    private LocalDateTime updated;

    @OneToMany(mappedBy = "comment")
    @JsonIgnore
    private List<Commentlikes> commentlikes = new ArrayList<>();

}