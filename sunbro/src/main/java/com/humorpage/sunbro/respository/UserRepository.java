package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    User findByUidOrPassword(String uid, String password);

    Optional<User> findByUsernum(Long usernum);

    UserDetails findAllByUid(String uid);

    Optional<User> findByUid(String uid);

}
