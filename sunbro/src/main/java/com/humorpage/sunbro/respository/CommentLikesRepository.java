package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Commentlikes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentLikesRepository extends JpaRepository<Commentlikes, Long> {
    List<Commentlikes> findAllById(Long id);
    List<Commentlikes> findAllByUser(Long user_id);
    List<Commentlikes> findAllByComment(Long comment_id);

    @Query(value = "SELECT id,comment_id, user_num from commentlikes where comment_id=?1 and user_num=?2", nativeQuery = true)
    Commentlikes findByCommentIdAndUsernum(Long comment_id, Long usernum);
}
