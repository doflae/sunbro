package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.Boardlikes;
import com.humorpage.sunbro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.List;

@Component
public interface BoardLikesRepository extends JpaRepository<Boardlikes, Long> {
    List<Boardlikes> findAllById(Long id);
    List<Boardlikes> findAllByUser(Long user_id);
    List<Boardlikes> findAllByBoard(Long board_id);

    @Query(value = "select board_id from boardlikes where user_num=?1", nativeQuery = true)
    List<Long> findAllByUsercustom(Long user_id);


}
