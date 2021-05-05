package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Data
@Table(name="boardlikes")
public class Boardlikes implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name="board_id")
    private Board board;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name="board_id",updatable = false,insertable = false)
    private BoardDetail boardDetail;

    @JsonBackReference
    @ManyToOne
    @JoinColumn(name = "user_num")
    private UserSimple user;
}
