package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import javax.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/api")
public class FileUploadApiController {


    @Autowired
    private FileUploadService fileUploadService;


    @PostMapping("/upload/local")
    public SingleResult<String> upload(@RequestParam("file") MultipartFile multipartFile, HttpServletRequest req) {
        return fileUploadService.uploadToLocal(multipartFile, req);
    }
}
