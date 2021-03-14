package com.humorpage.sunbro.service;

import org.apache.commons.io.IOUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStream;

@Service
public class FileViewService {

    static final String baseDir = "C://mediaFiles";


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
