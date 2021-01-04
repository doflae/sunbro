package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;

public interface CommentRepository extends JpaRepository<Comment, Integer> {
    @Query(value="Select * from comment c where c.epi_id = ?1", nativeQuery = true)
    Collection<Comment> getComment(Integer id);
}
