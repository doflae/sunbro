package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findAllById(Long id);
    Optional<Comment> findById(Long id);

    List<Comment> findTop3ByBoardIdOrderByLikesAsc(Long board_id);

    List<Comment> findByBoardIdLessThanOrderByIdDesc(Long board_id,Long comment_id, Pageable pageable);
    List<Comment> findByBoardIdGreaterThanOrderByIdAsc(Long board_id,Long comment_id, Pageable pageable);
    List<Comment> findAllByBoardId(Long board_id);
}
