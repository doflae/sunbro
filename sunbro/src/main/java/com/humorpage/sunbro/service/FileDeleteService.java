package com.humorpage.sunbro.service;

import com.humorpage.sunbro.respository.BoardRepository;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.apache.commons.io.FileUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;


@Service
public class FileDeleteService {

    @Autowired
    private TemporaryFileStore temporaryFileStore;

    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("/yyyy/MM/dd/");

    @Autowired
    private BoardRepository boardRepository;

    private final String baseDir = "C://mediaFiles";


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
