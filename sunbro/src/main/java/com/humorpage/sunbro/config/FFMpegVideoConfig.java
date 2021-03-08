package com.humorpage.sunbro.config;

import net.bramp.ffmpeg.FFmpeg;
import net.bramp.ffmpeg.FFprobe;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.PropertySource;

import java.io.IOException;

@Configuration
@PropertySource("classpath:ffmpeg.properties")
public class FFMpegVideoConfig {

    @Value("${video.ffmpeg.path}")
    private String ffmpegRunnablePath;

    @Value("${video.ffprobe.path}")
    private String ffprobeRunnalbePath;

    @Bean
    public FFmpeg ffmpeg() throws IOException{
        return genuineFFmpeg();
    }

    @Bean
    public FFprobe ffprobe() throws IOException{
        return genuineFFprobe();
    }

    private FFprobe genuineFFprobe() throws IOException{
        FFprobe fFprobe = new FFprobe(ffprobeRunnalbePath);
        fFprobe.isFFprobe();
        return fFprobe;
    }

    private FFmpeg genuineFFmpeg() throws IOException{
        FFmpeg fFmpeg = new FFmpeg(ffmpegRunnablePath);
        fFmpeg.isFFmpeg();
        return fFmpeg;
    }

}
