package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.FileUploadService;
import com.humorpage.sunbro.service.ResponseService;
import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import io.swagger.annotations.ApiOperation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;
import static org.springframework.util.MimeTypeUtils.APPLICATION_JSON_VALUE;

@RestController
@RequestMapping("/file")
public class FileUploadController {


    @Autowired
    private FileUploadService fileUploadService;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private FFMpegVideoConvert ffMpegVideoConvert;

    @GetMapping(path = "/delete")
    public CommonResult deleteImg(@RequestParam(value = "src") String src, Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            fileUploadService.deleteImg(src);
            return responseService.getSuccessResult();
        }catch (NullPointerException e){
            return responseService.getFailResult();
        }
    }

    @PostMapping(path = "/upload",
            consumes = MULTIPART_FORM_DATA_VALUE,
            produces = APPLICATION_JSON_VALUE,
            headers = "Accept=application/json")
    public SingleResult<String> upload(@RequestParam("file") MultipartFile file,
                                          @RequestParam(value = "src",required = false) String src, Authentication authentication) {
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            String pw = userSimple.getPassword();
            return responseService.getSingleResult(fileUploadService.tempUpload(file,src,pw.substring(pw.length()-4)));
        }catch (NullPointerException e){
            e.printStackTrace();
            return responseService.getFailSingleResult();
        }
    }
}