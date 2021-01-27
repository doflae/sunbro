package com.humorpage.sunbro.vaildator;

import com.humorpage.sunbro.model.Comment;
import org.springframework.stereotype.Component;
import org.springframework.validation.Errors;
import org.springframework.validation.Validator;
import org.thymeleaf.util.StringUtils;

@Component
public class CommentValidator implements Validator {
    @Override
    public boolean supports(Class<?> clazz){ return Comment.class.equals(clazz);}

    @Override
    public void validate(Object obj, Errors errors){
        Comment c = (Comment) obj;
        if(StringUtils.isEmpty(c.getContent())){
            errors.rejectValue("content","key","내용을 입력하세요");
        }
    }
}
