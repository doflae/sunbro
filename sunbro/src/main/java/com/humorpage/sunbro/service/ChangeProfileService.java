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

    public void ChangeImage(UserSimple saveTarget, String path){
        String beforeProfileImage = saveTarget.getUserImg();
        if(!beforeProfileImage.equals(path)){
            File f = new File(baseDir+beforeProfileImage);
            try{
                temporaryFileStore.delete(f.toPath());
            }catch (IOException | InvalidPathException ignored){

            }
            saveTarget.setUserImg(path);
            userSimpleRepository.save(saveTarget);
        }
    }
    public void ChangeProfile(UserSimple saveTarget, UserSimple newUserInfo){
        saveTarget.setAge(newUserInfo.getAge());
        saveTarget.setGender(newUserInfo.getGender());
        saveTarget.setName(newUserInfo.getName());
        String beforeProfileImage = saveTarget.getUserImg();
        if(!beforeProfileImage.equals(newUserInfo.getUserImg())){
            File f = new File(baseDir+beforeProfileImage);
            try{
                temporaryFileStore.delete(f.toPath());
            }catch (IOException | InvalidPathException ignored){

            }
            saveTarget.setUserImg(newUserInfo.getUserImg());
        }
        userSimpleRepository.save(saveTarget);
    }
}
