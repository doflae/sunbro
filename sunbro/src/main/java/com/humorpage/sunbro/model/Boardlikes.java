package com.humorpage.sunbro.model;

import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Data
@Table(name="boardlikes")
@IdClass(Boardlikes.class)
public class Boardlikes implements Serializable {

    @Id
    @Column(name = "board_id")
    private Long boardId;

    @Id
    @Column(name = "user_num")
    private Long userNum;
}
