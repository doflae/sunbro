package com.humorpage.sunbro.utils;

import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;

import static java.nio.file.Files.*;
import static java.util.Objects.nonNull;

/**
 * Simple temporary files implementation of {@link ResourceStore}
 */
@Component
public class TemporaryFileStore implements ResourceStore {


    @Override
    public Path store(InputStream inputStream) throws IOException{
        File file = createTemporaryFile().toFile();
        FileUtils.copyInputStreamToFile(inputStream,file);
        return file.toPath();
    }

    @Override
    public boolean delete(Path path) throws IOException {
        if(nonNull(path) && exists(path)) {
            Files.delete(path);
            return true;
        }
        return false;
    }

    public boolean create(File path){
        if(nonNull(path)&&!path.exists()){
            return path.mkdirs();
        }
        return false;
    }

    private Path createTemporaryFile() throws IOException {
        Path tempFile = createTempFile("probe-", ".tmp");
        tempFile.toFile().deleteOnExit();
        return tempFile;
    }
}
