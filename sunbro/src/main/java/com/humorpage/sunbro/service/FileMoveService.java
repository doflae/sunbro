package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;


@Service
public class FileMoveService {
    private final FFMpegVideoConvert ffMpegVideoConvert;
    private final TemporaryFileStore temporaryFileStore;

    private final String baseDir = "C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public/";

    private final Pattern thumbNailPattern = Pattern.compile("<(img|video)[^>]*src=[\"']?([^>\"']+)[\"']?[^>]*>");

    private final Pattern imgPattern = Pattern.compile("<img[^>]*src=[\"']?([^>\"']+)[\"']?[^>]*>");

    //에디터에서 미리 보여줄때는 div태그로 감싸 video를 불러들이지 못하게 하고 작성완료시 video태그로 변환
    private final Pattern videoPattern = Pattern.compile("<(div)[^>]*src=[\"']?([^>\"']+)[\"']?[^>]*(>)</div>");
    @Autowired
    public FileMoveService(TemporaryFileStore temporaryFileStore, FFMpegVideoConvert ffMpegVideoConvert){
        this.temporaryFileStore = temporaryFileStore;
        this.ffMpegVideoConvert = ffMpegVideoConvert;
    }

    //게시글 html 코드 받고 내부 img, video 태그의 src 추출 후 해당 path에서 영구 저장소로 파일 이동
    public String moveContents(String content){
        Matcher matcher = imgPattern.matcher(content);
        StringBuffer sb = new StringBuffer();

        while (matcher.find()){
            String target = matcher.group(1);
            String newPath = target.replace("/temp","");
            moveImg(target,newPath);
            matcher.appendReplacement(sb,content.substring(matcher.start(),matcher.start(1))+newPath+content.substring(matcher.end(1),matcher.end()));
        }
        content = matcher.appendTail(sb).toString();
        matcher = videoPattern.matcher(content);
        sb = new StringBuffer();
        while(matcher.find()){
            String target = matcher.group(2);
            String newPath = target.replace("/temp","");
            moveVideo(target,newPath);
            matcher.appendReplacement(sb,content.substring(matcher.start(),matcher.start(1))+"video"+
                    content.substring(matcher.end(1),matcher.start(2))+newPath+content.substring(matcher.end(2),matcher.start(3))+"/>");
        }
        return matcher.appendTail(sb).toString();
    }



    private void moveImg(String src, String target){
        Path file = Paths.get(baseDir+src);
        Path newPath = Paths.get(baseDir+target);
        File newDir = new File(newPath.getParent().toString());
        if(!newDir.exists()){
            newDir.mkdirs();
        }
        if(file.toFile().exists()){
            try{
                Files.move(file,newPath,REPLACE_EXISTING);
            }catch (IOException ignored){

            }
        }
    }

    private void moveVideo(String src, String target){
        Path file = Paths.get(baseDir+src);
        Path newPath = Paths.get(baseDir+target);
        File newDir = new File(newPath.getParent().toString());
        if(!newDir.exists()){
            newDir.mkdirs();
        }
        if(file.toFile().exists()){
            try{
                ffMpegVideoConvert.convertVideo(src,target);
                temporaryFileStore.delete(file);
            }catch (FFMpegVideoConvert.VideoConvertException | IOException ignored){

            }
        }
    }
}
