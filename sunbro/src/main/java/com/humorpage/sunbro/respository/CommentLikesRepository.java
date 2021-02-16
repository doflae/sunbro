package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Commentlikes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface CommentLikesRepository extends JpaRepository<Commentlikes, Long> {
    List<Commentlikes> findAllById(Long id);

    @Query(value = "select comment_id from commentlikes where user_num=?1", nativeQuery = true)
    List<Long> findAllByUsercustom(Long user_id);

    List<Commentlikes> findAllByUser(Long user_id);
    List<Commentlikes> findAllByComment(Long comment_id);

    @Query(value = "SELECT if((select count(*) from commentlikes where comment_id=?1 and user_num=?2)=1,TRUE,FALSE)", nativeQuery = true)
    Boolean findByCommentIdAndUsernum(Long comment_id, Long usernum);
}
