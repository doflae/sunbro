/*
package com.humorpage.sunbro.testmodel;


import com.humorpage.sunbro.model.audit.DateAudit;
import lombok.Getter;
import lombok.Setter;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name="epi_thumbnail")
public class EpiThumbnail extends DateAudit {

    @Id
    @Column(name="eth_no")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ethNo;

    @Column(name="file_name")
    private String fileName;

    @Column(name="file_type")
    private String fileType;

    @Column(name="file_uri")
    private String fileUri;

    @Column(name="file_size")
    private long fileSize;



    public EpiThumbnail(){

    }

    public EpiThumbnail(String fileName, String fileType, String fileUri, Long fileSize){
        this.fileName = fileName;
        this.fileUri = fileUri;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }
}
*/
