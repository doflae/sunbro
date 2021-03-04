package com.humorpage.sunbro.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import javax.persistence.*;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

@Entity
@Table(name="user")
@Data
public class UserSimple implements UserDetails {
    enum Sex{
        Male,Female
    }

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    @Column(name = "usernum")
    private Long usernum;

    @Column(nullable = false, unique = true, length = 30)
    @JsonIgnore
    private String uid;

    @Column(name="name", unique = true)
    private String name;

    @Column(name="profileImg",nullable = false)
    private String userImg;

    public void setUserImg(String userImg){
        userImg = userImg==null?"":userImg;
        this.userImg=userImg;
    }

    @JsonProperty(access = JsonProperty.Access.WRITE_ONLY)
    @Column(nullable = false, length = 100)
    private String password;

    @Column(name="sex")
    private Sex sex;

    @Column(name="birth")
    private int birth;

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
