package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.UserLog;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserLogRepository extends JpaRepository<UserLog, Long> {
    UserLog findByUsernum(Long usernum);
}
