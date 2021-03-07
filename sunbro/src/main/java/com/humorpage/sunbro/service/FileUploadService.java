package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.RandomGenerator;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Objects;
import java.util.stream.Stream;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

@Service
public class FileUploadService {

    private final FFMpegVideoConvert ffMpegVideoConvert;
    private final TemporaryFileStore temporaryFileStore;

    private final SimpleDateFormat format = new SimpleDateFormat("/yyyy/MM/dd/");
    private final String baseDir = "C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public";

    @Autowired
    public FileUploadService(TemporaryFileStore temporaryFileStore, FFMpegVideoConvert ffMpegVideoConvert){
        this.temporaryFileStore = temporaryFileStore;
        this.ffMpegVideoConvert = ffMpegVideoConvert;
    }


    public String createTemporaryDir() throws IOException{
        Date date = new Date();
        String tempDir = "temp"+RandomGenerator.RandomnameGenerate(8);
        while(!temporaryFileStore.create(new File(baseDir+format.format(date)+tempDir))){
            tempDir = "temp"+RandomGenerator.RandomnameGenerate(8);
        }
        return tempDir;
    }

    public void deleteImg(String path){
        try{
            path = path.equals("") ? null: baseDir+path;
            temporaryFileStore.delete(Path.of(path));
        }catch (IOException ignored){

        }
    }

    public String tempUpload(MultipartFile file, String tempDir, String beforePath, String last4str){
        try{
            String filename = beforePath.replaceFirst("[.][^.]+$", "");
            if(!beforePath.equals("") && filename.substring(filename.length()-4).equals(last4str)){
                temporaryFileStore.delete(Path.of(beforePath));
            }
        }catch (IOException |NullPointerException ignored){

        }
        try{
            byte[] data = file.getBytes();
            Date date = new Date();
            String[] tmp = Objects.requireNonNull(file.getContentType()).split("/");
            String filename = RandomGenerator.RandomnameGenerate(26)+last4str+"."+tmp[tmp.length-1];
            tempDir = format.format(date)+tempDir+"/";
            File dir = new File(baseDir+tempDir);
            if(!dir.exists()){
                if(dir.mkdirs()){
                    Path tempPath = Paths.get(baseDir+tempDir+filename);
                    Files.write(tempPath, data);
                    return tempDir+filename;
                }else{
                    return null;
                }
            }else{
                Path tempPath = Paths.get(baseDir+tempDir+filename);
                Files.write(tempPath, data);
                return tempDir+filename;
            }
        }catch (IOException e){
            e.printStackTrace();
            return null;
        }
    }
}
