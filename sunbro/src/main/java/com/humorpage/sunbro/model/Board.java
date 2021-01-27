package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;

import javax.persistence.*;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Size;
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

    @ManyToOne
    @JoinColumn(name = "user_id")
    private User user;

    //Board->Comment관계와 Comment->Board관계에 의해 서로를 계속 직렬화 -> 무한루프 오류
    //(그냥 본인 조회할때 반대편으로도 조회한다고 생각)
    //한 쪽에서는 끊어줄 필요가 있음
    //게시글을 조회하면서 댓글을 가져오므로 Comment->Board 직렬화를 막으면됨
    //JsonManagedReference는 직렬화를 수행하는 쪽
    @JsonManagedReference
    @OneToMany(mappedBy = "board", fetch = FetchType.LAZY)
    private List<Comment> comments = new ArrayList<>();
}
