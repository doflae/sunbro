package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.InvalidPathException;

@Service
public class ChangeProfileService {

    @Autowired
    TemporaryFileStore temporaryFileStore;

    @Autowired
    UserSimpleRepository userSimpleRepository;

    private final String baseDir = "C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public";

    public void ChangeProfile(UserSimple before, UserSimple newUserInfo){
        before.setAge(newUserInfo.getAge());
        before.setGender(newUserInfo.getGender());
        before.setName(newUserInfo.getName());
        String beforeProfileImage = before.getUserImg();
        if(!beforeProfileImage.equals(newUserInfo.getUserImg())){
            File f = new File(baseDir+beforeProfileImage);
            try{
                temporaryFileStore.delete(f.toPath());
            }catch (IOException | InvalidPathException ignored){

            }
            before.setUserImg(newUserInfo.getUserImg());
        }
        userSimpleRepository.save(before);
    }
}
