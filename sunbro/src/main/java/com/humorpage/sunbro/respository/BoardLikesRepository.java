package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Boardlikes;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Transactional(readOnly = true)
public interface BoardLikesRepository extends JpaRepository<Boardlikes, Long> {

    @Query(value = "select board_id from boardlikes where user_num=?1", nativeQuery = true)
    List<Long> findAllByUserCustom(Long user_id);

    Boardlikes findByBoardIdAndUserNum(Long boardId, Long userNum);

}
