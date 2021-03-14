package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;


@Service
public class FileDeleteService {

    @Autowired
    TemporaryFileStore temporaryFileStore;


    private final String baseDir = "C://mediaFiles";

    public void DeleteFiles(String path, MediaType mediaType){
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
