package com.humorpage.sunbro.respository;

import com.humorpage.sunbro.model.UploadFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FileUploadRepository extends JpaRepository<UploadFile,String> {
}
