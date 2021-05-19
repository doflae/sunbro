package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Commentlikes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;

@Component
public interface CommentLikesRepository extends JpaRepository<Commentlikes, Long> {
    @Query(value = "select comment_id from commentlikes where user_num=?1", nativeQuery = true)
    List<Long> findAllByUsercustom(Long user_id);

    Commentlikes findByCommentIdAndUserNum(Long commentId, Long userNum);
}
