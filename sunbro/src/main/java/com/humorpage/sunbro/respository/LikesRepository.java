package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.Likes;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface LikesRepository extends JpaRepository<Likes, Long> {
    List<Likes> findAllById(Long id);
    List<Likes> findAllByUser(Long user_id);
    List<Likes> findAllByBoard(Long board_id);
}
