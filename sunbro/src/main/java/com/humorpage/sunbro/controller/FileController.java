package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.*;
import com.humorpage.sunbro.service.S3Service;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;
import static org.springframework.util.MimeTypeUtils.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/api/file")
public class FileController {

    @Autowired
    private FileService fileService;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private VideoService videoService;

    @Autowired
    private S3Service s3Service;

    /**
     * TODO aws s3 적용시 제거
     */
    @GetMapping(value = "/get")
    public ResponseEntity<byte[]> getMediaFile(String name) throws IOException{
        return fileService.getFile(name);
    }

    /**
     * 비디오 업로드
     * async 는 같은 클래스 내 메소드 호출시 적용안되므로
     * videoService (동기), 비디오 업로드 호출 (비동기) -> 비디오 비율 반환
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
     */
    @PostMapping(path = "/upload/image",
            consumes = MULTIPART_FORM_DATA_VALUE,
            produces = APPLICATION_JSON_VALUE,
            headers = "Accept=application/json")
    public CommonResult imageUpload(MultipartFile file,
                               String path,
                               @RequestParam(required = false, defaultValue = "false") boolean needResize) {
        fileService.imageUpload(file,path,needResize);
        return responseService.getSuccessResult();
    }

}
