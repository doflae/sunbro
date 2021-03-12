package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FileUploadService {

    private final FFMpegVideoConvert ffMpegVideoConvert;
    private final TemporaryFileStore temporaryFileStore;


    @Autowired
    public FileUploadService(TemporaryFileStore temporaryFileStore, FFMpegVideoConvert ffMpegVideoConvert){
        this.temporaryFileStore = temporaryFileStore;
        this.ffMpegVideoConvert = ffMpegVideoConvert;
    }


    public void fileUpload(MultipartFile file, String path, boolean needConvert, MediaType mediaType){
        try{
            byte[] data = file.getBytes();
            String baseDir = "C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public";
            File dir = new File(baseDir +path);
            dir.getParentFile().mkdirs();
            Path target = Paths.get(baseDir +path);
            if(needConvert){
                Path tempFile = temporaryFileStore.store(data);
                if(ffMpegVideoConvert.checkVideoCodec(tempFile.toString())){
                    try{
                        ffMpegVideoConvert.convertVideo(tempFile.toString(),target.toString());
                    }catch (FFMpegVideoConvert.VideoConvertException ignored){

                    }
                }else{
                    Files.write(target,data);
                }
                //240/path/filename.jpg
                if(mediaType==MediaType.THUMBNAIL){
                    Pattern tempPattern = Pattern.compile("^(/.+/[^/]+)\\..+");
                    Matcher tempMatcher = tempPattern.matcher(path);
                    if(tempMatcher.find()){
                        String thumbnailPath = "/240"+tempMatcher.group(1)+".jpg";
                        File f = new File(baseDir+thumbnailPath);
                        f.getParentFile().mkdirs();
                        try{
                            ffMpegVideoConvert.extractThumbNail(baseDir+path,baseDir+thumbnailPath);
                        }catch (FFMpegVideoConvert.VideoConvertException ignored){

                        }
                    }
                }
                temporaryFileStore.delete(tempFile);
            }else{
                Files.write(target,data);
            }
        }catch (IOException e){
            e.printStackTrace();
        }
    }

}
