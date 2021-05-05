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
    List<Comment> findAllById(Long id);
    Optional<Comment> findById(Long id);

    List<Comment> findTop3ByBoardIdAndPidIsNullOrderByLikesDesc(Long board_id);

    List<Comment> findAllByPid(Long pid);
    List<Comment> findByPidIsOrderByIdAsc(Long pid,Pageable pageable);

    List<Comment> findByPidIsAndIdGreaterThanOrderByIdAsc(Long pid, Long comment_id, Pageable pageable);

    List<Comment> findByBoardIdAndIdLessThanOrderByIdDesc(Long board_id,Long comment_id, Pageable pageable);
    List<Comment> findByBoardIdAndIdGreaterThanAndPidIsNullOrderByIdAsc(Long board_id,Long comment_id, Pageable pageable);
    List<Comment> findAllByBoardId(Long board_id);
}
