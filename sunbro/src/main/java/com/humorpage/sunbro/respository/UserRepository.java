package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    User findByUidOrPassword(String uid, String password);

    User findAllByMsrl(Long msrl);

    UserDetails findAllByUid(String uid);

    Optional<User> findByUid(String uid);
}
