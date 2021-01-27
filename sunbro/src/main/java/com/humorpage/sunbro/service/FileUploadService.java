package com.humorpage.sunbro.service;

import com.humorpage.sunbro.result.SingleResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.util.Objects;

@Service
public class FileUploadService {

    @Autowired
    private ResponseService responseService;


    private static final SecureRandom random = new SecureRandom();
    public static String filenameGenerate(){
        StringBuilder sb = new StringBuilder(26);
        for(int i = 0; i<26;i++){
            String randChar = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
            sb.append(randChar.charAt(random.nextInt(randChar.length())));
        }
        return sb.toString();
    }
    public SingleResult<String> uploadToLocal(MultipartFile file, HttpServletRequest req) {
        try {
            byte[] data = file.getBytes();
            String uploadFolderPath;
            String[] tmp = Objects.requireNonNull(file.getContentType()).split("/");
            if (tmp[0].equals("image")){
                uploadFolderPath = "C:/Users/tjsh0/Desktop/React_project/humorpage/humorpage/public/images/";
            }else{
                uploadFolderPath = "C:/Users/tjsh0/Desktop/React_project/humorpage/humorpage/public/videos/";
            }
            String filename = filenameGenerate()+"."+tmp[tmp.length-1];
            Path path = Paths.get(uploadFolderPath + filename);
            Files.write(path, data);
            return responseService.getSingleResult(filename);
        } catch (IOException e) {
            e.printStackTrace();
            System.out.print("hi");
            return responseService.getSingleResult(null);
        }
    }
}
