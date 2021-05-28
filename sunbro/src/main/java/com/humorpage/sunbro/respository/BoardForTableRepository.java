package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardForTable;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional(readOnly = true)
public interface BoardForTableRepository extends JpaRepository<BoardForTable, Long> {
    List<BoardForTable> findByAuthorNumOrderByIdDesc(Long authorId, Pageable pageable);
    List<BoardForTable> findByIdInOrderByIdDesc(List<Long> ids,Pageable pageable);
}
