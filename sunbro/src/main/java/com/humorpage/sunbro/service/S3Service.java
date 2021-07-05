package com.humorpage.sunbro.service;

import com.amazonaws.services.s3.AmazonS3Client;
import com.amazonaws.services.s3.model.*;
import com.amazonaws.services.s3.transfer.MultipleFileUpload;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.amazonaws.services.s3.transfer.TransferManagerBuilder;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.PropertySource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;
import java.util.List;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Service
@PropertySource("classpath:aws.properties")
public class S3Service {

    private final AmazonS3Client s3Client;

    @Autowired
    private TemporaryFileStore temporaryFileStore;

    @Value("${cloud.aws.s3.bucket}")
    private String bucketName;


    public void upload(MultipartFile multipartFile, String fileName) throws IOException {
        fileName = checkPathStart(fileName);
        byte[] data = multipartFile.getBytes();
        Path tempFile = temporaryFileStore.store(data);
        putS3(tempFile.toFile(), fileName);
    }

    public void upload(File file, String fileName){
        fileName = checkPathStart(fileName);
        putS3(file,fileName);
    }

    public void uploadDir(File file, String dir){
        dir = checkPathStart(dir);
        TransferManager tm = TransferManagerBuilder.standard().withS3Client(s3Client).build();
        MultipleFileUpload upload = tm.uploadDirectory(
                bucketName,
                dir,
                file,true);
        try{
            temporaryFileStore.delete(file.toPath());
        }catch(IOException ignored){

        }
    }

    public void delete(String fileName) {
        fileName = checkPathStart(fileName);
        s3Client.deleteObject(new DeleteObjectRequest(bucketName, fileName));
    }

    public List<String> getFileList(String dir){
        ObjectListing objectListing =  s3Client.listObjects(bucketName, dir);
        return objectListing.getObjectSummaries()
                .stream().map(S3ObjectSummary::getKey).collect(Collectors.toList());
    }

    private void putS3(File file, String fileName){
        fileName = checkPathStart(fileName);
        s3Client.putObject(new PutObjectRequest(bucketName, fileName, file)
                .withCannedAcl(CannedAccessControlList.PublicRead));
        try {
            temporaryFileStore.delete(file.toPath());
        }catch(IOException ignored){

        }
    }

    private String checkPathStart(String path){
        if(path.startsWith("/")){
            return path.substring(1);
        }
        return path;
    }
}
