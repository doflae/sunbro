package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnore;
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
public class Comment implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "author_num")
    private UserSimple author;

    @NotNull
    private String content;

    @Column(name="board_id")
    @JsonIgnore
    private Long board;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created")
    @CreationTimestamp
    @JsonIgnore
    private LocalDateTime created;

    @GeneratedValue
    @Column(name ="updated")
    private LocalDateTime updated;

//    @JsonManagedReference
//    @OneToMany(mappedBy = "comment")
//    private List<Commentlikes> commentlikes = new ArrayList<>();

    @Basic(fetch = FetchType.LAZY)
    @Formula("(select count(*) from commentlikes cl where cl.comment_id=id)")
    private int likes;

    @Transient
    private boolean like;
}