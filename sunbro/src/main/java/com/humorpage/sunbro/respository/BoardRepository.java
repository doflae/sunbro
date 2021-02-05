package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface BoardRepository extends JpaRepository<Board, Long> {

    List<Board> findByTitle(String title);
    List<Board> findByTitleOrContent(String title, String content);
    List<Board> findAllById(Long id);

    List<Board> findByCreatedGreaterThan(LocalDateTime localDateTime);

    @Query(value = "SELECT * FROM board where id<?1 order by id desc limit 0,10",nativeQuery = true)
    List<Board> findRecentlyWithId(Long board_id);

    @Query(value = "SELECT * FROM board order by id desc limit 0,10",nativeQuery = true)
    List<Board> findRecentlyWithoutId();
}
