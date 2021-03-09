package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.FFMpegVideoConvert;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ThumbNailService {

    @Autowired
    ResizeService resizeService;

    private final FFMpegVideoConvert ffMpegVideoConvert;

    private final Pattern thumbNailPattern = Pattern.compile("<(img|video)[^>]*src=[\"']?([^>\"']+)[\"']?[^>]*>");

    @Autowired
    ThumbNailService(FFMpegVideoConvert ffMpegVideoConvert){
        this.ffMpegVideoConvert = ffMpegVideoConvert;
    }

    public String getThumbnailImage(String content) throws IOException {
        Matcher matcher = thumbNailPattern.matcher(content);
        if (matcher.find()){
            String src = matcher.group(2);
            String baseDir ="C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public";
            Pattern tempPattern = Pattern.compile("^(/.+/[^/]+)\\.(.+)");
            Matcher tempMatcher = tempPattern.matcher(src);
            if(matcher.group(1).equals("img")){
                String newImagePath = tempMatcher.group(1)+"thumbnail."+tempMatcher.group(2);
                File f = new File(baseDir+src);
                BufferedImage resizedImage = resizeService.resize(f,-1,240);
                ImageIO.write(resizedImage,tempMatcher.group(2),new File(baseDir+newImagePath));
                return newImagePath;
            }else{
                if(tempMatcher.find()){
                    String newImagePath = tempMatcher.group(1)+"thumbnail.jpg";
                    try{
                        ffMpegVideoConvert.extractThumbNail(baseDir+src,baseDir+newImagePath);
                        return newImagePath;
                    }catch (FFMpegVideoConvert.VideoConvertException e){
                        return null;
                    }
                }
            }
        }
        return null;
    }


}
