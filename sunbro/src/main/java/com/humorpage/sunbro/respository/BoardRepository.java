package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Board;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public interface BoardRepository extends JpaRepository<Board, Long> {

    Optional<Board> findById(Long id);

    @Query(value="Select created from board where id=:id",nativeQuery = true)
    LocalDateTime findByIdOnlyCreated(Long id);

    @Query(value = "Select content from board where id=:id",nativeQuery = true)
    String findByIdOnlyContent(Long id);
}
