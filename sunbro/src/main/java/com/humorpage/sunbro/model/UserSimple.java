package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name="user")
@Data
public class UserSimple implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "usernum")
    private Long usernum;

    @Column(nullable = false, unique = true, length = 30)
    @JsonIgnore
    private String uid;

    @Column(name="name", unique = true)
    private String name;

    @Column(name="profileImg",nullable = false)
    private String userImg="";

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false, length = 100)
    private String password;

    @Column(name="gender")
    private Gender gender = Gender.Male;

    @Column(name="age")
    private int age;

    @DateTimeFormat(pattern = "yyyy-MM-dd")
    @Column(name="joined")
    @CreationTimestamp
    @JsonIgnore
    private LocalDateTime created;


    private String role;
    @Override
    @JsonIgnore
    public Collection<? extends GrantedAuthority> getAuthorities() {
        List<GrantedAuthority> list = new ArrayList<>();
        list.add(new SimpleGrantedAuthority("ROLE_"+role));
        return list;
    }

    @Override
    @JsonIgnore
    public String getUsername() {
        return this.uid;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonExpired() {
        return false;
    }

    @Override
    @JsonIgnore
    public boolean isAccountNonLocked() {
        return false;
    }

    @Override
    @JsonIgnore
    public boolean isCredentialsNonExpired() {
        return false;
    }

    @Override
    @JsonIgnore
    public boolean isEnabled() {
        return false;
    }
}
