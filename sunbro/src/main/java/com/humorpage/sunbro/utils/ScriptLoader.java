package com.humorpage.sunbro.utils;

import org.springframework.core.io.DefaultResourceLoader;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ResourceLoader;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.io.InputStreamReader;
import java.io.Reader;
import java.io.UncheckedIOException;
import java.nio.charset.StandardCharsets;

class ScriptLoader {
    public static String getScript(String filePath){
        ResourceLoader resourceLoader = new DefaultResourceLoader();
        Resource resource = resourceLoader.getResource(filePath);
        try(Reader reader = new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8)){
            return FileCopyUtils.copyToString(reader);
        }catch (IOException e){
            throw new UncheckedIOException(e);
        }
    }
}
