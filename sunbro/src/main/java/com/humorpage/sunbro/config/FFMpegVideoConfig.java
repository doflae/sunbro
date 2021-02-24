package com.humorpage.sunbro.config;

import net.bramp.ffmpeg.FFmpeg;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;

@Configuration
public class FFMpegVideoConfig {

    @Value("${spring.ffmpeg.path}")
    private String ffmpegRunnablePath;

    @Bean
    public FFmpeg ffmpeg() throws IOException{
        return genuineFFmpeg();
    }

    private FFmpeg genuineFFmpeg() throws IOException{
        FFmpeg fFmpeg = new FFmpeg(ffmpegRunnablePath);
        fFmpeg.isFFmpeg();
        return fFmpeg;
    }

}
