package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardThumbnail;
import com.humorpage.sunbro.model.UserSimple;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Component
public interface BoardThumbnailRepository extends JpaRepository<BoardThumbnail, Long> {

    List<BoardThumbnail> findByTitleContaining(String title);

    List<BoardThumbnail> findByContentContaining(String content);

    List<BoardThumbnail> findByTitleContainingOrContentContaining(String title, String content);

    List<BoardThumbnail> findByCreatedGreaterThan(LocalDateTime localDateTime);

    List<BoardThumbnail> findByIdLessThanOrderByIdDesc(Long board_id, Pageable pageable);

    List<BoardThumbnail> findByOrderByIdDesc(Pageable pageable);

    List<BoardThumbnail> findAllByAuthor(Long author_num);

    List<BoardThumbnail> findByAuthorOrderByIdDesc(UserSimple author, Pageable pageable);

    List<BoardThumbnail> findByIdInOrderByIdDesc(List<Long> ids,Pageable pageable);

    List<BoardThumbnail> findByAuthorNumOrderByIdDesc(Long author_num, Pageable pageable);

    List<BoardThumbnail> findByAuthorNumAndIdLessThanOrderByIdDesc(Long author_num,Long last_id, Pageable pageable);
}
