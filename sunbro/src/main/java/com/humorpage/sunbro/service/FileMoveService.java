package com.humorpage.sunbro.service;

import org.springframework.stereotype.Service;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
public class FileMoveService {

    private final Pattern srcPattern = Pattern.compile("^\"/file/get?name=([^\".*])");

    private final String baseDir = "C://mediaFiles";

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
            List<File> filesInContent = new ArrayList<>();
            while(contentMatcher.find()){
                File f = new File(baseDir+contentMatcher.group(1));
                filesInContent.add(f);
                System.out.println(contentMatcher.group(1));
            }
            Matcher thumbMatcher = srcPattern.matcher(thumbNailImg);
            while(thumbMatcher.find()){
                File f = new File(baseDir+thumbMatcher.group(1));
                filesInContent.add(f);
                System.out.println(thumbMatcher.group(1));
            }
        }
    }
}
