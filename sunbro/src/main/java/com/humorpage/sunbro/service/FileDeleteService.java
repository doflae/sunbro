package com.humorpage.sunbro.service;

import com.humorpage.sunbro.model.Board;
import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;


@Service
public class FileDeleteService {

    @Autowired
    private TemporaryFileStore temporaryFileStore;

    @Autowired
    private BoardRepository boardRepository;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("/yyyy/MM/dd/");
    private final Pattern srcPattern = Pattern.compile("\"/file/get\\?name=([^\"]*)");

    //게시글 수정 시 글 파싱 후 삭제된 미디어 파일들 삭제
    //TODO: 댓글, m3u8 파일 새로운 디렉토리에 넣어서 관리-> 삭제되는지 테스트
    public void refreshDir(String contentAfter,
                           String thumbNailImg) throws IOException {
        Matcher contentMatcher = srcPattern.matcher(contentAfter);
        String mediaDir = null;
        File dir = null;
        if (contentMatcher.find()){
            mediaDir = FileViewService.baseDir+contentMatcher.group(1);
            File f = new File(mediaDir);
            dir = f.getParentFile();
        }
        if(dir!=null){
            contentMatcher = srcPattern.matcher(contentAfter);
            List<File> filesInFolder = Files.walk(dir.toPath())
                    .filter(Files::isRegularFile)
                    .map(Path::toFile)
                    .collect(Collectors.toList());
            while(contentMatcher.find()){
                File f = new File(FileViewService.baseDir+contentMatcher.group(1));
                filesInFolder.remove(f);
            }
            Matcher thumbMatcher = srcPattern.matcher(thumbNailImg);
            while(thumbMatcher.find()){
                File f = new File(FileViewService.baseDir+thumbMatcher.group(1));
                filesInFolder.remove(f);
            }
            filesInFolder.forEach(file->{
                file.delete();
            });
        }
    }

    //게시글 삭제시 mediaDir, created 조합 후 file path 찾아 삭제
    public void deleteDir(String target, Board board) throws IOException{
        String createPath = formatter.format(board.getCreated());
        File f = new File(FileViewService.baseDir+createPath+target);
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
            File f = new File(FileViewService.baseDir+target);
            try{
                temporaryFileStore.delete(f.toPath());
            }catch (Exception ignored){

            }
        });
    }
}
