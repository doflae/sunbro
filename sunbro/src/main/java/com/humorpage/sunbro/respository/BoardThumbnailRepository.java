package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardThumbnail;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BoardThumbnailRepository extends JpaRepository<BoardThumbnail, Long> {

    List<BoardThumbnail> findByTitle(String title);

    List<BoardThumbnail> findByContent(String content);

    List<BoardThumbnail> findByCreatedGreaterThan(LocalDateTime localDateTime);

    List<BoardThumbnail> findByIdLessThanOrderByIdDesc(Long board_id, Pageable pageable);

    List<BoardThumbnail> findByOrderByIdDesc(Pageable pageable);
}
