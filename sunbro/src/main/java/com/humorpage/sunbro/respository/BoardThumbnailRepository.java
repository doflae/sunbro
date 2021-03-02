package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardThumbnail;
import com.humorpage.sunbro.model.UserSimple;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface BoardThumbnailRepository extends JpaRepository<BoardThumbnail, Long> {

    List<BoardThumbnail> findByTitle(String title);

    List<BoardThumbnail> findByContent(String content);

    List<BoardThumbnail> findByTitleContaining(String title);

    List<BoardThumbnail> findByContentContaining(String content);

    List<BoardThumbnail> findByTitleContainingOrContentContaining(String title, String content);

    List<BoardThumbnail> findByCreatedGreaterThan(LocalDateTime localDateTime);

    List<BoardThumbnail> findByIdLessThanOrderByIdDesc(Long board_id, Pageable pageable);

    List<BoardThumbnail> findByOrderByIdDesc(Pageable pageable);

    List<BoardThumbnail> findAllByAuthor(Long author_num);

    List<BoardThumbnail> findByAuthorOrderByIdDesc(UserSimple author, Pageable pageable);

    List<BoardThumbnail> findByIdInOrderByIdDesc(List<Long> ids,Pageable pageable);
}
