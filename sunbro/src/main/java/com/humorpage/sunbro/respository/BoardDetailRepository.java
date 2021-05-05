package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardDetail;
import com.humorpage.sunbro.model.UserSimple;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Component
public interface BoardDetailRepository extends JpaRepository<BoardDetail, Long> {

    Optional<BoardDetail> findById(Long board_id);

    List<BoardDetail> findByTitleContaining(String title);

    List<BoardDetail> findByContentContaining(String content);

    List<BoardDetail> findByTitleContainingOrContentContaining(String title, String content);

    List<BoardDetail> findByCreatedGreaterThan(LocalDateTime localDateTime);

    List<BoardDetail> findByIdLessThanOrderByIdDesc(Long board_id, Pageable pageable);

    List<BoardDetail> findByOrderByIdDesc(Pageable pageable);

    List<BoardDetail> findAllByAuthorNum(Long author_num);

    List<BoardDetail> findByAuthorNumOrderByIdDesc(Long author_num, Pageable pageable);

    List<BoardDetail> findByAuthorNumAndIdLessThanOrderByIdDesc(Long author_num, Long last_id, Pageable pageable);
}
