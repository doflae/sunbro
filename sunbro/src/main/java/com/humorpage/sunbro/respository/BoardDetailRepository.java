package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardDetail;
import com.humorpage.sunbro.model.UserSimple;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Isolation;
import org.springframework.transaction.annotation.Transactional;

import javax.persistence.EntityManager;
import javax.persistence.PersistenceContext;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

//TODO: OrderBy DB에서 하지말고 WAS에서 하도록 변경 (자원 효율성)
@Transactional(readOnly = true)
public interface BoardDetailRepository extends JpaRepository<BoardDetail, Long> {

    Optional<BoardDetail> findById(Long board_id);

    List<BoardDetail> findByIdInOrderByLikesDesc(List<Long> board_ids);

    List<BoardDetail> findByTitleContaining(String title);

    List<BoardDetail> findByContentContaining(String content);

    List<BoardDetail> findByTitleContainingOrContentContaining(String title, String content);

    List<BoardDetail> findByIdLessThanOrderByIdDesc(Long board_id, Pageable pageable);

    List<BoardDetail> findByOrderByIdDesc(Pageable pageable);

    List<BoardDetail> findAllByAuthorNum(Long author_num);

    List<BoardDetail> findByAuthorNumOrderByIdDesc(Long author_num, Pageable pageable);

    List<BoardDetail> findByAuthorNumAndIdLessThanOrderByIdDesc(Long author_num, Long last_id, Pageable pageable);

    @Modifying
    @Query(value = "UPDATE board SET likes=likes+1 WHERE id=?1",nativeQuery = true)
    void incrementBoardLikes(Long board_id);

    @Modifying
    @Query(value = "UPDATE board SET likes=likes-1 WHERE id=?1",nativeQuery = true)
    void decrementBoardLikes(Long board_id);
}
