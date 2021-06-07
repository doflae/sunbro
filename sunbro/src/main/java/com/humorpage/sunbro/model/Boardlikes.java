package com.humorpage.sunbro.model;

import lombok.Data;

import javax.persistence.*;

@Entity
@Data
@Table(name="boardlikes")
public class Boardlikes {

    @Column(name = "board_id")
    private Long boardId;

    @Column(name = "user_num")
    private Long userNum;
}
