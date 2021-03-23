package com.humorpage.sunbro.service;

import com.humorpage.sunbro.advice.exception.UserNotFoundException;
import com.humorpage.sunbro.respository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Service;



//Need to Rename
@RequiredArgsConstructor
@Service
public class CustomUserDetailService implements UserDetailsService {

    @Autowired
    private UserRepository userRepository;

    public UserDetails loadUserByUsername(String userPk) {
        return (UserDetails) userRepository.findById(Long.valueOf(userPk)).orElseThrow(()->new UserNotFoundException("ID"));
    }
}