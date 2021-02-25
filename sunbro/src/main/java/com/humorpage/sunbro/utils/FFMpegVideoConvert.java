package com.humorpage.sunbro.utils;

import lombok.extern.slf4j.Slf4j;
import net.bramp.ffmpeg.FFmpeg;
import net.bramp.ffmpeg.builder.FFmpegBuilder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Slf4j
@Component
public class FFMpegVideoConvert {

    private final FFmpeg fFmpeg;

    private final String baseDir ="C:/Users/tjsh0/OneDrive/Desktop/sunbro/humorpage/public/";

    @Autowired
    public FFMpegVideoConvert(FFmpeg fFmpeg){
        this.fFmpeg = fFmpeg;
    }

    public void extractThumbNail(String input, String ouput) throws VideoConvertException{
        FFmpegBuilder builder = new FFmpegBuilder()
                .setInput(baseDir+input)
                .addOutput(baseDir+ouput)
                .addExtraArgs("-ss","00:00:00.100")
                .addExtraArgs("-vf","scale=-1:240")//이미지 height 240에 맞춰서 비율 재조정
                .addExtraArgs("-vframes","1").done();
        try{
            fFmpeg.run(builder);
        }catch (Exception e){
            throw new VideoConvertException(e);
        }
    }

    public void convertVideo(String input, String output) throws VideoConvertException{
        FFmpegBuilder builder = new FFmpegBuilder()
                .setInput(baseDir +input)
                .addOutput(baseDir +output)
                .addExtraArgs("-c:v","libx264")
                .addExtraArgs("-c:a","aac").done();
        try{
            fFmpeg.run(builder);
        }catch (Exception e){
            throw new VideoConvertException(e);
        }
    }

    public void createThumbnail(String input, String output) throws VideoThumbNailException{
        FFmpegBuilder builder = new FFmpegBuilder().setInput(input)
                .addOutput(output).addExtraArgs("-ss","00:00:01.000")
                .addExtraArgs("-vframes","1").done();
        try{
            fFmpeg.run(builder);
        }catch (Exception e){
            throw new VideoThumbNailException(e);
        }
    }
    public static class VideoThumbNailException extends Exception{
        public VideoThumbNailException(Throwable ex){ super(ex);}

        @Override
        public String toString(){return "Unable to get thumbnail from video file";}
    }
    public static class VideoConvertException extends Exception{
        public VideoConvertException(Throwable ex){
            super(ex);
        }

        @Override
        public String toString(){ return "Unable to convert video file";}
    }
}
