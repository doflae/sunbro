package com.humorpage.sunbro.utils;

import com.humorpage.sunbro.service.FileUploadService;
import com.humorpage.sunbro.service.JwtTokenService;
import org.springframework.stereotype.Component;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.attribute.PosixFilePermission;
import java.util.Set;

import static java.nio.file.Files.*;
import static java.nio.file.StandardCopyOption.REPLACE_EXISTING;
import static java.util.Objects.nonNull;

/**
 * Simple temporary files implementation of {@link ResourceStore}
 */
@Component
public class TemporaryFileStore implements ResourceStore {


    @Override
    public Path store(InputStream inputStream) throws IOException {
        Path filePath = createTemporaryFile();
        copy(inputStream, filePath, REPLACE_EXISTING);
        return filePath;
    }

    @Override
    public boolean delete(Path path) throws IOException {
        if(nonNull(path) && exists(path)) {
            Files.delete(path);
            return true;
        }
        return false;
    }

    public boolean create(File path) throws IOException{
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
