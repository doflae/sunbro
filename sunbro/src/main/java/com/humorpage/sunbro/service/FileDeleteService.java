package com.humorpage.sunbro.service;

import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
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

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("/yyyy/MM/dd/");

    @Autowired
    private BoardRepository boardRepository;

    private final String baseDir = "C://mediaFiles";

    private final Pattern srcPattern = Pattern.compile("\"/file/get\\?name=([^\"]*)");

    public void refreshDir(String contentAfter,
                           String thumbNailImg) throws IOException {
        Matcher contentMatcher = srcPattern.matcher(contentAfter);
        String mediaDir = null;
        File dir = null;
        if (contentMatcher.find()){
            mediaDir = baseDir+contentMatcher.group(1);
            File f = new File(mediaDir);
            dir = f.getParentFile();
        }
        if(dir!=null){
            contentMatcher = srcPattern.matcher(contentAfter);
            List<File> filesInFolder = Files.walk(dir.toPath())
                    .filter(Files::isRegularFile)
                    .map(Path::toFile)
                    .collect(Collectors.toList());
            filesInFolder.forEach(file->System.out.println(file.toString()));
            while(contentMatcher.find()){
                File f = new File(baseDir+contentMatcher.group(1));
                filesInFolder.remove(f);
            }
            Matcher thumbMatcher = srcPattern.matcher(thumbNailImg);
            while(thumbMatcher.find()){
                File f = new File(baseDir+thumbMatcher.group(1));
                filesInFolder.remove(f);
            }
            filesInFolder.forEach(file->{
                file.delete();
            });
        }
    }

    public void deleteDir(String target, Long board_id){
        LocalDateTime created = boardRepository.findByIdOnlyCreated(board_id);
        String createPath = formatter.format(created);
        File f = new File(baseDir+createPath+target);
        try{
            FileUtils.deleteDirectory(f);
        }catch (Exception ignored){

        }
    }

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
}
