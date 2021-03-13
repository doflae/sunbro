package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import com.humorpage.sunbro.utils.TemporaryFileStore;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import javax.swing.*;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class FileUploadService {

    private final FFMpegVideoConvert ffMpegVideoConvert;
    private final TemporaryFileStore temporaryFileStore;


    @Autowired
    public FileUploadService(TemporaryFileStore temporaryFileStore, FFMpegVideoConvert ffMpegVideoConvert){
        this.temporaryFileStore = temporaryFileStore;
        this.ffMpegVideoConvert = ffMpegVideoConvert;
    }


    public void fileUpload(MultipartFile file, String path, boolean needConvert, MediaType mediaType, boolean needResize){
        try{
            byte[] data = file.getBytes();
            String baseDir = "C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public";
            File dir = new File(baseDir +path);
            dir.getParentFile().mkdirs();
            Path target = Paths.get(baseDir +path);
            if(needConvert){
                Path tempFile = temporaryFileStore.store(data);
                if(ffMpegVideoConvert.checkVideoCodec(tempFile.toString())){
                    try{
                        ffMpegVideoConvert.convertVideo(tempFile.toString(),target.toString());
                    }catch (FFMpegVideoConvert.VideoConvertException ignored){

                    }
                }else{
                    Files.write(target,data);
                }
                //240/path/filename.jpg
                if(mediaType==MediaType.THUMBNAIL){
                    Pattern tempPattern = Pattern.compile("^(/.+/[^/]+)\\..+");
                    Matcher tempMatcher = tempPattern.matcher(path);
                    if(tempMatcher.find()){
                        String thumbnailPath = "/240"+tempMatcher.group(1)+".jpg";
                        File f = new File(baseDir+thumbnailPath);
                        f.getParentFile().mkdirs();
                        try{
                            ffMpegVideoConvert.extractThumbNail(baseDir+path,baseDir+thumbnailPath);
                        }catch (FFMpegVideoConvert.VideoConvertException ignored){

                        }
                    }
                }
                temporaryFileStore.delete(tempFile);
            }else{
                if(needResize){
                    Path tempPath = temporaryFileStore.store(data);
                    System.out.println(tempPath.toString());
                    ImageIcon Icon = new ImageIcon(tempPath.toString());
                    Pattern getSizePattern = Pattern.compile("^/(.+)/.+/[^/]+\\.(.+)");
                    Matcher matcher = getSizePattern.matcher(path);
                    if(matcher.find()){
                        Image image = Icon.getImage();
                        int size = Integer.parseInt(matcher.group(1));
                        Image newImg = image.getScaledInstance(size,size,Image.SCALE_DEFAULT);
                        Icon = new ImageIcon(newImg);
                        System.out.println(size);
                        BufferedImage bi = getBufferedImage(Icon.getImage());
                        ByteArrayOutputStream baos = new ByteArrayOutputStream();
                        ImageIO.write(bi, matcher.group(2), baos);
                        data = baos.toByteArray();
                    }
                }
                Files.write(target,data);

            }
        }catch (IOException e){
            e.printStackTrace();
        }
    }
    private static BufferedImage getBufferedImage(Image img)
    {
        if (img instanceof BufferedImage)
        {
            return (BufferedImage) img;
        }

        BufferedImage bimage = new BufferedImage(img.getWidth(null),
                img.getHeight(null), BufferedImage.TYPE_4BYTE_ABGR);

        Graphics2D bGr = bimage.createGraphics();
        bGr.drawImage(img, 0, 0, null);
        bGr.dispose();

        // Return the buffered image
        return bimage;
    }
}
