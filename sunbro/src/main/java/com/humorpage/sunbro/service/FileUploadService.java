package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.GifUtils.GifUtil;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FileUploadService {

    private final FFMpegVideoConvert ffMpegVideoConvert;
    private final TemporaryFileStore temporaryFileStore;
    static Pattern videoPattern =Pattern.compile("^(/.+/)([^/]+)\\..+");

    @Autowired
    public FileUploadService(TemporaryFileStore temporaryFileStore, FFMpegVideoConvert ffMpegVideoConvert){
        this.temporaryFileStore = temporaryFileStore;
        this.ffMpegVideoConvert = ffMpegVideoConvert;
    }


    @Async("fileUploadExecutor")
    public void videoUpload(Path tempFile, String path)
            throws Exception{
        Matcher tempMatcher = videoPattern.matcher(path);
        if (tempMatcher.find()) {
            String thumbnailPath = tempMatcher.group(1) + "thumb.jpg";
            ffMpegVideoConvert.createThumbnail(tempFile.toString(), FileViewService.baseDir + thumbnailPath);
            ffMpegVideoConvert.convertVideo(tempFile.toString(),tempMatcher.group(1),tempMatcher.group(2));
        }
        temporaryFileStore.delete(tempFile);
    }


    @Async("fileUploadExecutor")
    public void imageUpload(MultipartFile file, String path, MediaType mediaType, boolean needResize){
        try{
            byte[] data = file.getBytes();
            File dir = new File(FileViewService.baseDir +path);
            dir.getParentFile().mkdirs();
            Path target = Paths.get(FileViewService.baseDir +path);
            if(needResize){
                Path tempFile = temporaryFileStore.store(data);
                int maxSize;
                if (mediaType == MediaType.PROFILE) {
                    maxSize = 72;
                } else {
                    maxSize = 100;
                }
                GifUtil.gifInputToOutput(tempFile.toFile(),target.toFile(),maxSize);
            }
            else{
                Files.write(target,data);
            }
        }catch (IOException e){
            //TODO 에러 처리
            e.printStackTrace();
        }
    }
}
