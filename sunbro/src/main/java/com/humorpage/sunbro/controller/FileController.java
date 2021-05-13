package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.*;
import com.humorpage.sunbro.utils.FFMpegVideoConvert;
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

    @Autowired
    private VideoService videoService;


    @GetMapping(value = "/get")
    public ResponseEntity<byte[]> getMediaFile(String name) throws IOException{
        return fileViewService.getFile(name);
    }


    /**
     * 비디오 업로드
     * @param file 비디오
     * @param path 저장 경로
     * @return 비디오 비율 w/h
     */
    @PostMapping(path = "/upload/video",
            consumes = MULTIPART_FORM_DATA_VALUE,
            produces = APPLICATION_JSON_VALUE,
            headers = "Accept=application/json")
    public SingleResult<String> videoUpload(MultipartFile file,
                                            String path){
        return responseService.getSingleResult(videoService.videoUpload(file,path));
    }

    /**
     * @param file 멀티 미디어 파일
     * @param path 상대 경로 + 파일네임
     * @param mediaType 멀티 미디어 파일 사용 용도
     */
    @PostMapping(path = "/upload/image",
            consumes = MULTIPART_FORM_DATA_VALUE,
            produces = APPLICATION_JSON_VALUE,
            headers = "Accept=application/json")
    public CommonResult imageUpload(MultipartFile file,
                               String path,
                               @RequestParam(required = false, defaultValue = "BOARD") MediaType mediaType,
                               @RequestParam(required = false, defaultValue = "false") boolean needResize) {
        fileUploadService.imageUpload(file,path,mediaType,needResize);
        return responseService.getSuccessResult();
    }

}
