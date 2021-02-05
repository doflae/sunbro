package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Board;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;


import java.time.LocalDateTime;
import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {

    List<Board> findByTitle(String title);
    List<Board> findByTitleOrContent(String title, String content);
    List<Board> findAllById(Long id);

    List<Board> findByCreatedGreaterThan(LocalDateTime localDateTime);

    List<Board> findRecentlyWithId(@Param("board_id") Long board_id, Pageable pageable);

    @Query(value = "SELECT b FROM Board b order by b.id desc")
    List<Board> findRecentlyWithoutId(Pageable pageable);
}
