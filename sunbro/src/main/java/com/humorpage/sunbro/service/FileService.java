package com.humorpage.sunbro.service;

import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.GifUtils.GifUtil;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FileUtils;
import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FileService {

    public static String baseDir = "C://mediaFiles";
    static Pattern srcPattern = Pattern.compile("\"/api/file/get\\?name=([^.]*.([^\"]*))");
    static Pattern videoPattern =Pattern.compile("^(/.+/)([^/]+)\\..+");

    @Autowired
    private TemporaryFileStore temporaryFileStore;

    @Autowired
    private FFMpegVideoConvert ffMpegVideoConvert;

    @Autowired
    private BoardRepository boardRepository;


    @Async("fileUploadExecutor")
    public void videoUpload(Path tempFile, String path)
            throws Exception{
        Matcher tempMatcher = videoPattern.matcher(path);
        if (tempMatcher.find()) {
            String thumbnailPath = tempMatcher.group(1) + "thumb.jpg";
            ffMpegVideoConvert.createThumbnail(tempFile.toString(), baseDir + thumbnailPath);
            ffMpegVideoConvert.convertVideo(tempFile.toString(),tempMatcher.group(1),tempMatcher.group(2));
        }
        temporaryFileStore.delete(tempFile);
    }


    @Async("fileUploadExecutor")
    public void imageUpload(MultipartFile file, String path,String parentPath, MediaType mediaType, boolean needResize){
        try{
            byte[] data = file.getBytes();
            if(mediaType==MediaType.COMMENT){
                File parent = new File(baseDir+parentPath);
                if(!parent.exists()){
                    return;
                }
            }
            File dir = new File(baseDir +path);
            dir.getParentFile().mkdirs();
            if(needResize){
                Path tempFile = temporaryFileStore.store(data);
                int maxSize;
                if (mediaType == MediaType.PROFILE) {
                    maxSize = 120;
                } else {
                    maxSize = 100;
                }
                GifUtil.gifInputToOutput(tempFile.toFile(),dir,maxSize);
            }
            else{
                Files.write(dir.toPath(),data);
            }
        }catch (IOException e){
            //TODO 에러 처리
            e.printStackTrace();
        }
    }

    /**
     * mediaDir 탐색 -> dir, file 목록(filesInFolder)
     * content 파싱 -> media path 목록(filesInContent)
     * A에서 B제외, cmt 폴더 제외, 나머지 제거
     * @param mediaDir 미디어 directory path
     * @param contentAfter 변경된 내용
     * @param thumbNailImg 변경된 썸네일
     */
    public void refreshDir(String mediaDir,
                           String contentAfter,
                           String thumbNailImg) throws IOException {
        File dir = new File(baseDir+mediaDir);
        if(dir.exists()){
            Matcher contentMatcher = srcPattern.matcher(contentAfter);
            List<File> filesInFolder = Files.walk(dir.toPath(),1)
                    .map(Path::toFile)
                    .collect(Collectors.toList());

            filesInFolder.remove(new File(baseDir+mediaDir+"/cmt"));
            filesInFolder.remove(new File(baseDir+mediaDir));
            while(contentMatcher.find()){
                if(contentMatcher.group(2).equals("m3u8")){
                    String file = contentMatcher.group(1);
                    int i = file.lastIndexOf("/");
                    if(i!=-1){
                        File f = new File(baseDir+file.substring(0,i));
                        filesInFolder.remove(f);
                    }
                }else{
                    File f = new File(baseDir+contentMatcher.group(1));
                    filesInFolder.remove(f);
                }
            }
            if(thumbNailImg.isEmpty()) return;
            Matcher thumbMatcher = srcPattern.matcher(thumbNailImg);
            while(thumbMatcher.find()){
                File f = new File(baseDir+thumbMatcher.group(1));
                filesInFolder.remove(f);
            }
            filesInFolder.forEach(File::delete);
        }
    }

    public void deleteDir(String target) throws IOException{
        File f = new File(baseDir+target);
        FileUtils.deleteDirectory(f);
    }


    public ResponseEntity<byte[]> getFile(String name){
        try{
            InputStream inputStream = new FileInputStream(baseDir+name);
            byte[] byteArray = IOUtils.toByteArray(inputStream);
            inputStream.close();
            return new ResponseEntity<byte[]>(byteArray, HttpStatus.OK);
        }catch (IOException ignored){
            return new ResponseEntity<byte[]>((byte[]) null,HttpStatus.OK);
        }
    }
}
