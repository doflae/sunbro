package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Data
@Table(name="board")
public class Board {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private long id;

    @NotNull
    @Size(min=2, max=30, message="제목은 2자이상 30자 이하입니다.")
    private String title;
    private String content;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created")
    @CreationTimestamp
    private LocalDateTime created;

    @GeneratedValue
    @Column(name ="updated")
    private LocalDateTime updated;

    @OneToMany(mappedBy = "board", fetch = FetchType.LAZY)
    @JsonIgnore
    private List<Likes> likes = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "author_id")
    private User author;
//
//    @JsonManagedReference
//    @ManyToMany(
//            cascade = CascadeType.REMOVE,
//            mappedBy = "likedBoards"
//    )
//    private List<User> likedUsers = new ArrayList<>();

    //Board->Comment관계와 Comment->Board관계에 의해 서로를 계속 직렬화 -> 무한루프 오류
    //(그냥 본인 조회할때 반대편으로도 조회한다고 생각)
    //한 쪽에서는 끊어줄 필요가 있음
    //게시글을 조회하면서 댓글을 가져오므로 Comment->Board 직렬화를 막으면됨
    //JsonManagedReference는 직렬화를 수행하는 쪽
    @JsonManagedReference
    @OneToMany(mappedBy = "board", fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();
}
