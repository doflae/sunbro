package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findAllById(Long id);
    Optional<Comment> findById(Long id);

    @Query(value = "SELECT c.id as id FROM comment c where c.id=?1", nativeQuery = true)
    Optional<CommentMapping> findcustomById(Long id);

    @Query(value="SELECT * FROM comment where board_id=?1",nativeQuery = true)
    List<Comment> findAllByBoardId(Long board_id);
}
