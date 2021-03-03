package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import javax.imageio.ImageReader;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ThumbNailService {
    private final FFMpegVideoConvert ffMpegVideoConvert;

    private final Pattern thumbNailPattern = Pattern.compile("<(img|video)[^>]*src=[\"']?([^>\"']+)[\"']?[^>]*>");

    @Autowired
    ThumbNailService(FFMpegVideoConvert ffMpegVideoConvert){
        this.ffMpegVideoConvert = ffMpegVideoConvert;
    }

    //call after File move
    public String getThumbnailImage(String content) throws IOException {
        Matcher matcher = thumbNailPattern.matcher(content);
        if (matcher.find()){
            String src = matcher.group(2);
            if(src.startsWith("videos")){
                Pattern tempPattern = Pattern.compile("^(videos)/(.+)/([^/]+)\\..+");
                Matcher tempMatcher = tempPattern.matcher(src);
                if(tempMatcher.find()){
                    String newImagePath = "images/"+tempMatcher.group(2)+tempMatcher.group(3)+"thumbnail.jpg";
                    try{
                        ffMpegVideoConvert.extractThumbNail(src,newImagePath);
                        return newImagePath;
                    }catch (FFMpegVideoConvert.VideoConvertException e){
                        return null;
                    }
                }
            }else{
                Pattern tempPattern = Pattern.compile("^(.+/[^/]+)\\.(.+)");
                Matcher tempMatcher = tempPattern.matcher(src);
                System.out.println(src);
                if(tempMatcher.find()){
                    String baseDir ="C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public/";
                    File f = new File(baseDir+src);
                    BufferedImage resizedImage = resize(f,-1,240);
                    System.out.println(tempMatcher.group(1));
                    String newImagePath = tempMatcher.group(1)+"thumbnail."+tempMatcher.group(2);
                    ImageIO.write(resizedImage,tempMatcher.group(2),new File(baseDir+newImagePath));
                    System.out.println(newImagePath);
                    return newImagePath;
                }
            }
        }
        return null;
    }

    private BufferedImage resize(File inputimg, int width, int height) throws IOException{
        BufferedImage inputImage = ImageIO.read(inputimg);
        if(width==-1){
            width = inputImage.getWidth()*height/inputImage.getHeight();
        }else if(height==-1){
            height = inputImage.getHeight()*width/inputImage.getWidth();
        }
        Image tmp = inputImage.getScaledInstance(width,height,Image.SCALE_SMOOTH);
        BufferedImage outputImage = new BufferedImage(width, height, inputImage.getType());

        Graphics2D grapics2D = outputImage.createGraphics();
        grapics2D.drawImage(tmp, 0, 0,null);
        grapics2D.dispose();

        return outputImage;
    }

}
