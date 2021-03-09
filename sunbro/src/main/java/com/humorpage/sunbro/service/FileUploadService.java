package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.RandomGenerator;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.apache.commons.io.FileUtils;
import org.apache.tools.ant.taskdefs.Sleep;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.Objects;
import java.util.stream.Stream;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

@Service
public class FileUploadService {

    private final FFMpegVideoConvert ffMpegVideoConvert;
    private final TemporaryFileStore temporaryFileStore;

    @Autowired
    ResizeService resizeService;

    @Autowired
    public FileUploadService(TemporaryFileStore temporaryFileStore, FFMpegVideoConvert ffMpegVideoConvert){
        this.temporaryFileStore = temporaryFileStore;
        this.ffMpegVideoConvert = ffMpegVideoConvert;
    }


    @Async("fileUploadExecutor")
    public void fileUpload(MultipartFile file, String path, boolean needConvert, MediaType mediaType){
        try{
            byte[] data = file.getBytes();
            String baseDir = "C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public";
            File dir = new File(baseDir +path);
            dir.getParentFile().mkdirs();
            Path tempPath = Paths.get(baseDir +path);
            if(needConvert){
                Path tempFile = temporaryFileStore.store(data);
                if(ffMpegVideoConvert.checkVideoCodec(tempFile.toString())){
                    try{
                        ffMpegVideoConvert.convertVideo(tempFile.toString(),tempPath.toString());
                    }catch (FFMpegVideoConvert.VideoConvertException ignored){

                    }
                }else{
                    Files.write(tempPath, data);
                }
                temporaryFileStore.delete(tempFile);
            }else{
                Files.write(tempPath, data);
                File f = new File(tempPath.toString());
                switch (mediaType){
                    case COMMENT -> {
                        resizeService.resizeAndSave(f,"/120x120"+path,120,120);
                    }
                    case PROFILE -> {
                        resizeService.resizeAndSave(f,"/120x120"+path,120,120);
                        resizeService.resizeAndSave(f,"/72x72"+path,72,72);
                    }
                }
            }
        }catch (IOException e){
            e.printStackTrace();
        }
    }

}
