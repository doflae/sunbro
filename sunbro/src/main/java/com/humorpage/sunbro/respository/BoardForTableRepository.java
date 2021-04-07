package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.BoardForTable;
import com.humorpage.sunbro.model.BoardThumbnail;
import com.humorpage.sunbro.model.UserSimple;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardForTableRepository extends JpaRepository<BoardForTable, Long> {
    List<BoardForTable> findByAuthorOrderByIdDesc(UserSimple author, Pageable pageable);
    List<BoardForTable> findByIdInOrderByIdDesc(List<Long> ids,Pageable pageable);

}
