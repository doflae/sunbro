package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class ChangeProfileService {

    @Autowired
    TemporaryFileStore temporaryFileStore;

    @Autowired
    UserSimpleRepository userSimpleRepository;

    @Autowired
    FileDeleteService fileDeleteService;

    private final String baseDir = "C://mediaFiles";

    public void ChangeImage(UserSimple saveTarget, String path){
        String beforeProfileImage = saveTarget.getUserImg();
        if(!beforeProfileImage.equals(path)){
            fileDeleteService.deleteFiles(beforeProfileImage,MediaType.PROFILE);
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
            fileDeleteService.deleteFiles(beforeProfileImage,MediaType.PROFILE);
            saveTarget.setUserImg(newUserInfo.getUserImg());
        }
        userSimpleRepository.save(saveTarget);
    }
}
