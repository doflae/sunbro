package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.UserNotFoundException;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.UserRepository;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSimpleRepository userSimpleRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;


    public UserSimple findUserSimpleByUserNum(Long userNum){
        return userSimpleRepository.findByUserNum(userNum);
    }

    public void deleteUser(User user){
        userRepository.delete(user);
    }

    public void deleteUserSimple (UserSimple userSimple){
        userSimpleRepository.delete(userSimple);
    }
}
