package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Comment;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Component
public interface CommentRepository extends JpaRepository<Comment, Long> {
    Optional<Comment> findById(Long id);
    List<Comment> findByIdIn(List<Long> ids);

    List<Comment> findByParentIdIsOrderByIdAsc(Long pid, Pageable pageable);

    List<Comment> findByParentIdIsAndIdGreaterThanOrderByIdAsc(Long pid, Long comment_id, Pageable pageable);

    List<Comment> findByBoardIdAndIdGreaterThanAndParentIdIsNullOrderByIdAsc(Long board_id, Long comment_id, Pageable pageable);
}
