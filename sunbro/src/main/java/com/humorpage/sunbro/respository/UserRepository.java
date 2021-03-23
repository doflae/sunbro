package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Component
public interface UserRepository extends JpaRepository<User, Long> {

    User findByUserNum(Long userNum);
    Optional<User> findByUid(String uid);

}
