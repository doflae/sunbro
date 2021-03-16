package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardSimple;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BoardSimpleRepository extends JpaRepository<BoardSimple,Long> {
    Optional<BoardSimple> findById(Long board_id);
}
