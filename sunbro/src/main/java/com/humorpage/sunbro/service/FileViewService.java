package com.humorpage.sunbro.service;

import org.apache.commons.io.IOUtils;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
public class FileViewService {

    static final String baseDir = "C://mediaFiles/";

    public ResponseEntity<byte[]> getFile(String name) throws IOException {
        InputStream inputStream = new FileInputStream(baseDir+name);
        byte[] byteArray = IOUtils.toByteArray(inputStream);
        inputStream.close();
        return new ResponseEntity<byte[]>(byteArray, HttpStatus.OK);
    }
}
