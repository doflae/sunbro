package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.nio.file.Path;

@Service
public class VideoService {
    @Autowired
    private TemporaryFileStore temporaryFileStore;

    @Autowired
    private FFMpegVideoConvert ffMpegVideoConvert;

    @Autowired
    private FileService fileService;

    public String videoUpload(MultipartFile file, String path){
        try{
            byte[] data = file.getBytes();
            Path tempFile = temporaryFileStore.store(data);
            String ret =  ffMpegVideoConvert.checkVideoRatio(tempFile.toString());
            File dir = new File(FileService.baseDir+path);
            dir.getParentFile().mkdirs();
            fileService.videoUpload(tempFile,path);
            return ret;
        }
        catch (Exception e){
            e.printStackTrace();
        }
        return null;
    }
}
