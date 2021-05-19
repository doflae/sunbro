package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardWithLikes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BoardWithLikesRepository extends JpaRepository<BoardWithLikes,Long> {
    List<BoardWithLikes> findByCreatedGreaterThan(LocalDateTime created);
}
