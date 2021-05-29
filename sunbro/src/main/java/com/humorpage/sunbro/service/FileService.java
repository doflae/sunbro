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
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Slf4j
@Service
public class FileService {

    static final String baseDir = "C://mediaFiles";
    private final Pattern srcPattern = Pattern.compile("\"/file/get\\?name=([^\"]*)");
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
                    maxSize = 72;
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

    //게시글 수정 시 글 파싱 후 삭제된 미디어 파일들 삭제
    //TODO 동영상 (m3u8) directory 삭제
    public void refreshDir(String mediaDir,
                           String contentAfter,
                           String thumbNailImg) throws IOException {
        File dir = new File(baseDir+mediaDir);
        if(dir.exists()){
            Matcher contentMatcher = srcPattern.matcher(contentAfter);
            List<File> filesInFolder = Files.walk(dir.toPath())
                    .map(Path::toFile)
                    .collect(Collectors.toList());

            filesInFolder.remove(new File(baseDir+mediaDir+"/cmt"));

            while(contentMatcher.find()){
                File f = new File(baseDir+contentMatcher.group(1));
                filesInFolder.remove(f);
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

    //게시글 삭제시 mediaDir, created 조합 후 file path 찾아 삭제
    public void deleteDir(String target) throws IOException{
        File f = new File(baseDir+target);
        log.info(baseDir+target);
        FileUtils.deleteDirectory(f);
    }


    //댓글, 프로필, 썸네일은 변경 혹은 삭제 시 리사이징 된 파일도 삭제
    /*TODO 미디어 파일 경로 수정 및 mediaType 제거
        프로필 사진은 항상 120px로 고정 원본 제거
     */
    public void deleteFiles(String path, MediaType mediaType){
        List<String> deleteList = new ArrayList<>(Collections.singletonList(path));
        switch (mediaType){
            case COMMENT -> {
                deleteList.add("/120"+path);
            }
            case PROFILE -> {
                deleteList.add("/120"+path);
                deleteList.add("/72"+path);
            }
            case THUMBNAIL -> {
                deleteList.add("/240"+path);
            }
        }
        deleteList.forEach(target->{
            File f = new File(baseDir+target);
            try{
                temporaryFileStore.delete(f.toPath());
            }catch (Exception ignored){

            }
        });
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
