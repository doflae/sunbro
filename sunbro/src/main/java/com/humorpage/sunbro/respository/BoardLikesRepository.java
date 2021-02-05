package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.model.Boardlikes;
import com.humorpage.sunbro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BoardLikesRepository extends JpaRepository<Boardlikes, Long> {
    List<Boardlikes> findAllById(Long id);
    List<Boardlikes> findAllByUser(Long user_id);
    List<Boardlikes> findAllByBoard(Long board_id);
    Boardlikes findByUserAndBoard(User user, Board board);
}
