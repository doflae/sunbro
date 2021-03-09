package com.humorpage.sunbro.utils;

import lombok.extern.slf4j.Slf4j;
import net.bramp.ffmpeg.FFmpeg;
import net.bramp.ffmpeg.FFprobe;
import net.bramp.ffmpeg.builder.FFmpegBuilder;
import net.bramp.ffmpeg.probe.FFmpegProbeResult;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.awt.image.BufferedImage;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.List;

@Slf4j
@Component
public class FFMpegVideoConvert {

    private final FFmpeg ffmpeg;
    private final FFprobe ffprobe;


    @Autowired
    public FFMpegVideoConvert(FFmpeg ffmpeg, FFprobe ffprobe){
        this.ffmpeg = ffmpeg;
        this.ffprobe = ffprobe;
    }

    //need Absolute Path
    public void extractThumbNail(String input, String ouput) throws VideoConvertException{

        FFmpegBuilder builder = new FFmpegBuilder()
                .setInput(input)
                .addOutput(ouput)
                .addExtraArgs("-ss","00:00:00.100")
                .addExtraArgs("-vf","scale=-1:240")//이미지 height 240에 맞춰서 비율 재조정
                .addExtraArgs("-vframes","1").done();
        try{
            ffmpeg.run(builder);
        }catch (Exception e){
            throw new VideoConvertException(e);
        }
    }

    //input은 임시저장소의 절대경로
    public boolean checkVideoCodec(String tempFile) throws IOException {
        FFmpegProbeResult probeResult = ffprobe.probe(tempFile);
        String codec = probeResult.getStreams().get(0).codec_name;
        return codec.equals("hevc");
    }

    public void convertVideo(String input, String output) throws VideoConvertException{
        FFmpegBuilder builder = new FFmpegBuilder()
                .setInput(input)
                .addOutput(output)
                .addExtraArgs("-c:v","libx264")
                .addExtraArgs("-c:a","aac").done();
        try{
            ffmpeg.run(builder);
        }catch (Exception e){
            throw new VideoConvertException(e);
        }
    }

    public void createThumbnail(String input, String output) throws VideoThumbNailException{
        FFmpegBuilder builder = new FFmpegBuilder().setInput(input)
                .addOutput(output).addExtraArgs("-ss","00:00:01.000")
                .addExtraArgs("-vframes","1").done();
        try{
            ffmpeg.run(builder);
        }catch (Exception e){
            throw new VideoThumbNailException(e);
        }
    }

    public static class VideoExtractCodecInfoException extends Exception{
        public VideoExtractCodecInfoException(Throwable ex){super(ex);}

        @Override
        public String toString(){return "Failed to get video code info";}
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
