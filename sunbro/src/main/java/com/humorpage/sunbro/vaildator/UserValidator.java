package com.humorpage.sunbro.vaildator;

import com.humorpage.sunbro.model.User;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;
import org.thymeleaf.util.StringUtils;

@Component
public class UserValidator implements Validator {
    @Override
    public boolean supports(Class<?> clazz) {return User.class.equals(clazz);}

    @Override
    public void validate(Object obj, Errors errors){
        User u = (User) obj;
        if(StringUtils.isEmpty(u.getName())){
            errors.rejectValue("name","이름을 입력하세요");
        }
    }
}
