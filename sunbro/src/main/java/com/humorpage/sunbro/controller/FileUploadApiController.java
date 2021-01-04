package com.humorpage.sunbro.controller;


import com.humorpage.sunbro.model.UploadFile;
import com.humorpage.sunbro.response.FileUploadResponse;
import com.humorpage.sunbro.service.FileUploadService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

@RestController
@RequestMapping("/api")
public class FileUploadApiController {


    @Autowired
    private FileUploadService fileUploadService;


    @PostMapping("/upload/local")
    public void upload(@RequestParam("file") MultipartFile multipartFile) {
        fileUploadService.uploadToLocal(multipartFile);
    }

    @PostMapping("/upload/db")
    public FileUploadResponse uploadDb(@RequestParam("file") MultipartFile multipartFile) {

        UploadFile uploadFile = fileUploadService.uploadToDb(multipartFile);
        FileUploadResponse response = new FileUploadResponse();
        if (uploadFile != null) {
            String downloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                    .path("/api/download/")
                    .path(uploadFile.getFileId())
                    .toUriString();
            response.setDownloadUri(downloadUri);
            response.setFileId(uploadFile.getFileId());
            response.setFileType(uploadFile.getFileType());
            response.setUploadStatus(true);
            response.setMessage("File Uploaded Successfully");

            return response;

        }
        response.setMessage("Upload fail");
        return response;
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<Resource> downloadFile(@PathVariable String id) {

        UploadFile uploadFileToRet = fileUploadService.downloadFile(id);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(uploadFileToRet.getFileType()))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename= " + uploadFileToRet.getFileName())
                .body(new ByteArrayResource(uploadFileToRet.getFileData()));

    }
}
