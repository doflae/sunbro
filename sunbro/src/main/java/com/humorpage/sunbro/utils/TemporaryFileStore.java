package com.humorpage.sunbro.utils;

import org.apache.commons.io.FileUtils;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;

import static java.nio.file.Files.*;
import static java.util.Objects.nonNull;

@Component
public class TemporaryFileStore implements ResourceStore {


    @Override
    public Path store(byte[] data) throws IOException{
        Path path = createTemporaryFile();
        write(path,data);
        return path;
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
