package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import lombok.Data;

import javax.persistence.*;
import java.io.Serializable;

@Entity
@Table(name="user")
@Data
public class UserThumbNail implements Serializable {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    @Column(name = "usernum")
    private Long usernum;
    @Column(nullable = false, unique = true, length = 30)
    private String uid;
}
