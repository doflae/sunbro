package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.format.annotation.DateTimeFormat;

import javax.persistence.*;
import javax.validation.constraints.NotBlank;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@NamedQueries({
        @NamedQuery(name="Board.findRecentlyWithId",
        query = "SELECT b FROM Board b where b.id <:board_id order by b.id desc")
})
@NamedEntityGraphs({
        @NamedEntityGraph(name="Board.BoardForThumbnail",attributeNodes = {
                @NamedAttributeNode("id"),
                @NamedAttributeNode("title"),
                @NamedAttributeNode("content"),
                @NamedAttributeNode("created"),
                @NamedAttributeNode("author"),
                @NamedAttributeNode("thumbnail")
        })
})
@Entity
@Data
@Table(name="board")
public class Board implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private long id;

    @NotBlank
    @Column(name = "title")
    private String title;

    @NotBlank
    @Column(name="content")
    private String content;

    @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    @Column(name = "created")
    @CreationTimestamp
    private LocalDateTime created;

    @GeneratedValue
    @Column(name ="updated")
    private LocalDateTime updated;

    @JsonManagedReference
    @OneToMany(mappedBy = "board", fetch = FetchType.LAZY)
    private List<Boardlikes> boardlikes = new ArrayList<>();

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "author_id")
    private User author;


    private String thumbnail;

    @JsonManagedReference
    @OneToMany(mappedBy = "board", fetch = FetchType.EAGER)
    private List<Comment> comments = new ArrayList<>();

    public int getBoardlikesLength(){
        return this.boardlikes.size();
    }
}
