package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.UserSimple;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Component;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Transactional(readOnly = true)
public interface UserSimpleRepository extends JpaRepository<UserSimple, Long> {

    UserSimple findByUserNum(Long userNum);
    Optional<UserSimple> findByUid(String uid);
    Optional<UserSimple> findByName(String name);

}
