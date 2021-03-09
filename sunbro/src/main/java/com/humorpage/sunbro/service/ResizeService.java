package com.humorpage.sunbro.service;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class ResizeService {

    public BufferedImage resize(File inputImg, int width, int height) throws IOException {
        System.out.println(inputImg.canRead());
        BufferedImage inputImage = ImageIO.read(inputImg);
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

    public void resizeAndSave(File inputImg, String path, int width, int height){
        String baseDir ="C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public";
        Pattern tempPattern = Pattern.compile("^(/.+/[^/]+)\\.(.+)");
        Matcher tempMatcher = tempPattern.matcher(path);
        if(tempMatcher.find()){
            try {
                BufferedImage inputImage = ImageIO.read(inputImg);
                if (width == -1) {
                    width = inputImage.getWidth() * height / inputImage.getHeight();
                } else if (height == -1) {
                    height = inputImage.getHeight() * width / inputImage.getWidth();
                }
                Image tmp = inputImage.getScaledInstance(width, height, Image.SCALE_SMOOTH);
                BufferedImage resizedImage = new BufferedImage(width, height, inputImage.getType());

                Graphics2D grapics2D = resizedImage.createGraphics();
                grapics2D.drawImage(tmp, 0, 0, null);
                grapics2D.dispose();

                String resizeImgPath = tempMatcher.group(1) + "." + tempMatcher.group(2);
                File f = new File(baseDir+resizeImgPath);
                f.getParentFile().mkdirs();
                ImageIO.write(resizedImage, tempMatcher.group(2), new File(baseDir + resizeImgPath));
            }catch (IOException ignored){

            }
        }
    }
}
