package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardDetail;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BoardDetailRepository extends JpaRepository<BoardDetail, Long> {
    Optional<BoardDetail> findById(Long board_id);
}
