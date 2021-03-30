package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.service.FileUploadService;
import com.humorpage.sunbro.service.FileViewService;
import com.humorpage.sunbro.service.MediaType;
import com.humorpage.sunbro.service.ResponseService;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;
import static org.springframework.util.MimeTypeUtils.APPLICATION_JSON_VALUE;

@RestController
@CrossOrigin(value = "http://localhost:3000", allowCredentials = "true")
@RequestMapping("/api/file")
public class FileController {


    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private FileViewService fileViewService;

    @Autowired
    private ResponseService responseService;


    @GetMapping(value = "/get")
    public ResponseEntity<byte[]> getMediaFile(String name) throws IOException{
        return fileViewService.getFile(name);
    }


    /**
     * @param file 멀티 미디어 파일
     * @param path 상대 경로 + 파일네임
     * @param needConvert 비디오의 경우 코덱 변환 여부
     * @param mediaType 멀티 미디어 파일 사용 용도
     */
    @PostMapping(path = "/upload",
            consumes = MULTIPART_FORM_DATA_VALUE,
            produces = APPLICATION_JSON_VALUE,
            headers = "Accept=application/json")
    public CommonResult upload(MultipartFile file,
                               @RequestParam(required = false) String path,
                               @RequestParam(required = false, defaultValue = "false") boolean needConvert,
                               @RequestParam(required = false, defaultValue = "BOARD") MediaType mediaType,
                               @RequestParam(required = false, defaultValue = "false") boolean needResize,
                               Authentication authentication) {
        if(authentication!=null && authentication.isAuthenticated()){
            fileUploadService.fileUpload(file,path,needConvert,mediaType,needResize);
            return responseService.getSuccessResult();
        }else{
            return responseService.getFailResult();
        }
    }

}
