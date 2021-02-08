package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.respository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User save(User user){

        String encodedpassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(encodedpassword);
        user.setEnabled(true);

        return userRepository.save(user);

    }

    public Optional<User> loadUserByUsernum(Long usernum){
        return userRepository.findByUsernum(usernum);
    }

}
