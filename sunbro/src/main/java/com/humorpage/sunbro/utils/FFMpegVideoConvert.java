package com.humorpage.sunbro.utils;

import lombok.extern.slf4j.Slf4j;
import net.bramp.ffmpeg.FFmpeg;
import net.bramp.ffmpeg.FFprobe;
import net.bramp.ffmpeg.builder.FFmpegBuilder;
import net.bramp.ffmpeg.probe.FFmpegProbeResult;
import net.bramp.ffmpeg.probe.FFmpegStream;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.regex.Pattern;

@Slf4j
@Component
public class FFMpegVideoConvert {

    private final FFmpeg ffmpeg;
    private final FFprobe ffprobe;
    private final String baseDir = "C://mediaFiles";

    @Autowired
    public FFMpegVideoConvert(FFmpeg ffmpeg, FFprobe ffprobe){
        this.ffmpeg = ffmpeg;
        this.ffprobe = ffprobe;
    }

    public String checkVideoRatio(String tempFile) throws IOException {
        FFmpegProbeResult probeResult = ffprobe.probe(tempFile);
        FFmpegStream fFmpegStream = probeResult.getStreams().get(0);
        return fFmpegStream.width+":"+fFmpegStream.height;
    }

    public void convertVideo(String input, String dir, String filename) throws VideoConvertException{
        FFmpegBuilder builder = new FFmpegBuilder()
                .setInput(input)
                .addOutput(baseDir+dir+filename+".m3u8")
                .addExtraArgs("-b:v","1M")
                .addExtraArgs("-g","60")
                .addExtraArgs("-hls_init_time","5")
                .addExtraArgs("-hls_time","2")
                .addExtraArgs("-hls_list_size","0")
                .addExtraArgs("-hls_base_url","get?name="+dir).done();
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
