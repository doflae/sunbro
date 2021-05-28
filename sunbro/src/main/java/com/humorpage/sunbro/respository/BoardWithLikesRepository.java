package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardWithLikes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Transactional(readOnly = true)
public interface BoardWithLikesRepository extends JpaRepository<BoardWithLikes,Long> {
    List<BoardWithLikes> findByCreatedGreaterThan(LocalDateTime created);
}
