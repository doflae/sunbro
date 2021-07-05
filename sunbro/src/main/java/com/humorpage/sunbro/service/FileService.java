package com.humorpage.sunbro.service;

import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.GifUtils.GifUtil;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import lombok.extern.slf4j.Slf4j;
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

    @Autowired
    private S3Service s3Service;

    @Async("fileUploadExecutor")
    public void videoUpload(Path tempFile, String path)
            throws Exception{
        Matcher tempMatcher = videoPattern.matcher(path);
        if (tempMatcher.find()) {
            String thumbnailPath = tempMatcher.group(1) + "thumb.jpg";
            ffMpegVideoConvert.createThumbnail(tempFile.toString(), baseDir + thumbnailPath);
            ffMpegVideoConvert.convertVideo(tempFile.toString(),tempMatcher.group(1),tempMatcher.group(2));
            s3Service.uploadDir(new File(baseDir+tempMatcher.group(1)),
                    tempMatcher.group(1));
        }
        temporaryFileStore.delete(tempFile);
    }

    /**
     * @param file  업로드 파일
     * @param path  업로드 경로
     * @param needResize    gif파일의 경우 js에서 리사이징이 안되기에 서버에서 리사이징
     */
    @Async("fileUploadExecutor")
    public void imageUpload(MultipartFile file,
                            String path,
                            boolean needResize){
        try{
            if(needResize){
                byte[] data = file.getBytes();
                Path tempFile = temporaryFileStore.store(data);
                File newFile = temporaryFileStore.createTemporaryFile().toFile();
                GifUtil.gifInputToOutput(tempFile.toFile(), newFile);
                s3Service.upload(newFile,path);
            }
            else{
                s3Service.upload(file,path);
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
     * TODO s3 적용
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

    public void deleteCmtDir(String target) throws IOException{
        File f = new File(target);
        s3Service.delete(f.getParentFile().getParent());
    }


    public ResponseEntity<byte[]> getFile(String name){
        try{
            InputStream inputStream = new FileInputStream(baseDir+name);
            byte[] byteArray = IOUtils.toByteArray(inputStream);
            inputStream.close();
            return new ResponseEntity<>(byteArray, HttpStatus.OK);
        }catch (IOException ignored){
            return new ResponseEntity<>((byte[]) null, HttpStatus.OK);
        }
    }
}
