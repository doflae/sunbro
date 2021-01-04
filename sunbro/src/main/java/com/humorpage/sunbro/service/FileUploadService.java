package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.UploadFile;
import com.humorpage.sunbro.respository.FileUploadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

@Service
public class FileUploadService {

    private String uploadFolderPath = "C://Users/tjsh0/sunbro/";

    @Autowired
    private FileUploadRepository fileUploadRepository;

    public void uploadToLocal(MultipartFile file) {

        try {
            byte[] data = file.getBytes();

            Path path = Paths.get(uploadFolderPath + file.getOriginalFilename());
            Files.write(path, data);
            System.out.print(file);
            System.out.print(path);
        } catch (IOException e) {
            e.printStackTrace();
        }

    }

    public UploadFile uploadToDb(MultipartFile file) {

        UploadFile uploadFile = new UploadFile();
        try {
            uploadFile.setFileData(file.getBytes());
            uploadFile.setFileType(file.getContentType());
            uploadFile.setFileName(file.getOriginalFilename());
            UploadFile uploadFileToRet = fileUploadRepository.save(uploadFile);
            return uploadFileToRet;
        } catch (IOException e) {
            e.printStackTrace();
            return null;
        }

    }

    public UploadFile downloadFile(String fileId){
        UploadFile uploadFileToRet = fileUploadRepository.getOne(fileId);

        return uploadFileToRet;

    }
}
