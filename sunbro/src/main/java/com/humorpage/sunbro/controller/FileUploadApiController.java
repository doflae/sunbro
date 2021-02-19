package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.FileUploadService;
import com.humorpage.sunbro.service.ResponseService;
import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;
import static org.springframework.util.MimeTypeUtils.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/file")
@CrossOrigin(origins = "http://localhost:3000")
public class FileUploadApiController {


    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private FFMpegVideoConvert videoFileUitls;

    @PostMapping(path = "/img",
            consumes = MULTIPART_FORM_DATA_VALUE,
            produces = APPLICATION_JSON_VALUE,
            headers = "Accept=application/json")
    public SingleResult<String> uploadImg(@RequestParam("file") MultipartFile file,Authentication authentication) {
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            return responseService.getSingleResult(fileUploadService.uploadImg(file));
        }catch (NullPointerException e){
            return responseService.getFailSingleResult();
        }
    }
    @PostMapping(path = "/video",
            consumes = MULTIPART_FORM_DATA_VALUE,
            produces = APPLICATION_JSON_VALUE,
            headers = "Accept=application/json")
    public SingleResult<String> uploadVideo(@RequestParam("file") MultipartFile file,Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            return responseService.getSingleResult(fileUploadService.uploadVideo(file.getInputStream()));
        }catch (NullPointerException | IOException | FFMpegVideoConvert.VideoConvertException e){
            return responseService.getFailSingleResult();
        }
    }
}
