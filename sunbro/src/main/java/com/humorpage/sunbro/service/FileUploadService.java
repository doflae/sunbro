package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.net.URLConnection;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.security.SecureRandom;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Objects;
import java.util.stream.Stream;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;

@Service
public class FileUploadService {

    private final FFMpegVideoConvert ffMpegVideoConvert;
    private final TemporaryFileStore temporaryFileStore;

    private final SimpleDateFormat format = new SimpleDateFormat("yyyy/MM/dd/");
    private final String baseDir = "C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public/";

    @Autowired
    public FileUploadService(TemporaryFileStore temporaryFileStore, FFMpegVideoConvert ffMpegVideoConvert){
        this.temporaryFileStore = temporaryFileStore;
        this.ffMpegVideoConvert = ffMpegVideoConvert;
    }

    private static final SecureRandom random = new SecureRandom();
    private static String filenameGenerate(){
        StringBuilder sb = new StringBuilder(26);
        for(int i = 0; i<26;i++){
            String randChar = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM";
            sb.append(randChar.charAt(random.nextInt(randChar.length())));
        }
        return sb.toString();
    }

    public void deleteImg(String path){
        try{
            path = path.equals("") ? null: baseDir+path;
            temporaryFileStore.delete(Path.of(path));
        }catch (IOException ignored){

        }
    }

    public String tempUpload(MultipartFile file, String beforePath, String last4str){
        try{
            String filename = beforePath.replaceFirst("[.][^.]+$", "");
            if(!beforePath.equals("") && filename.substring(filename.length()-4).equals(last4str)){
                temporaryFileStore.delete(Path.of(beforePath));
            }
        }catch (IOException |NullPointerException ignored){

        }
        try{
            byte[] data = file.getBytes();
            Date date = new Date();
            String[] tmp = Objects.requireNonNull(file.getContentType()).split("/");
            String filename = filenameGenerate()+last4str+"."+tmp[tmp.length-1];
            String tempDir;
            if (tmp[0].equals("image")){
                tempDir = "images/temp/"+format.format(date);
            }else{
                tempDir = "videos/temp/"+format.format(date);
            }
            File dir = new File(baseDir+tempDir);
            if(!dir.exists()){
                if(dir.mkdirs()){
                    Path tempPath = Paths.get(baseDir+tempDir+filename);
                    Files.write(tempPath, data);
                    return tempDir+filename;
                }else{
                    return null;
                }
            }else{
                Path tempPath = Paths.get(baseDir+tempDir+filename);
                Files.write(tempPath, data);
                return tempDir+filename;
            }
        }catch (IOException e){
            e.printStackTrace();
            return null;
        }
    }
    public static boolean isImageFile(String path) {
        String mimeType = URLConnection.guessContentTypeFromName(path);
        return mimeType != null && mimeType.startsWith("image");
    }

    public String completeUpload(String tempDir, String targetDir){
        try(Stream<Path> paths = Files.walk(Paths.get(tempDir))){
            paths.filter(Files::isRegularFile)
                    .forEach(path -> {
                        String filename = path.getFileName().toString();
                        if(isImageFile(path.toString())){
                            try {
                                Files.move(path,Path.of(targetDir+filename),REPLACE_EXISTING);
                            } catch (IOException e) {
                                e.printStackTrace();
                            }
                        }else{
                            try{
                                ffMpegVideoConvert.convertVideo(path.toString(),targetDir+filename);
                            } catch (FFMpegVideoConvert.VideoConvertException e) {
                                e.printStackTrace();
                            }
                        }
                    });
            Files.delete(Path.of(tempDir));
            return targetDir;
        }catch (IOException ignored){

        }
        return null;
    }

}
