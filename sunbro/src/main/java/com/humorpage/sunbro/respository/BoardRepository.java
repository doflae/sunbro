package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Optional;

public interface BoardRepository extends JpaRepository<Board, Long> {

    Optional<Board> findById(Long id);

    @Query(value = "Select content from board where id=:id",nativeQuery = true)
    String findByIdOnlyContent(Long id);
}
