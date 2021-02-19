package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.util.Objects;

@Service
public class FileUploadService {

    private final FFMpegVideoConvert ffMpegVideoConvert;
    private final TemporaryFileStore temporaryFileStore;

    @Autowired
    public FileUploadService(TemporaryFileStore temporaryFileStore, FFMpegVideoConvert ffMpegVideoConvert){
        this.temporaryFileStore = temporaryFileStore;
        this.ffMpegVideoConvert = ffMpegVideoConvert;
    }

    private static final SecureRandom random = new SecureRandom();
    private static String filenameGenerate(){
        StringBuilder sb = new StringBuilder(26);
        for(int i = 0; i<26;i++){
            String randChar = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
            sb.append(randChar.charAt(random.nextInt(randChar.length())));
        }
        return sb.toString();
    }
    public String uploadImg(MultipartFile file) {
        try {
            byte[] data = file.getBytes();
            String[] tmp = Objects.requireNonNull(file.getContentType()).split("/");
            String filename = filenameGenerate()+"."+tmp[tmp.length-1];
            String imgFolderPath = "C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public/images/";
            Path path = Paths.get(imgFolderPath + filename);
            Files.write(path, data);
            return filename;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }
    }
    public String uploadVideo(InputStream inputStream) throws FFMpegVideoConvert.VideoConvertException, IOException{
        Path file =null;
        try{
            file = temporaryFileStore.store(inputStream);
            String randName = filenameGenerate();
            return ffMpegVideoConvert.convertVideo(file,randName);
        }finally {
            temporaryFileStore.delete(file);
        }
    }
}
