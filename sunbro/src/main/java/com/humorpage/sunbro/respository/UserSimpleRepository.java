package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.UserSimple;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserSimpleRepository extends JpaRepository<UserSimple, Long> {

    UserSimple findByUsernum(Long usernum);
    Optional<UserSimple> findByUid(String uid);

}
