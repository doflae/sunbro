/*
package com.humorpage.sunbro.testmodel;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.humorpage.sunbro.model.audit.DateAudit;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import javax.persistence.*;

@Getter
@Setter
@Entity
@Table(name="thumbnail")
public class Thumbnail extends DateAudit {
    @Id
    @Column(name="ttno")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer ttno;

    @Column(name="file_name")
    private String fileName;

    @Column(name="file_type")
    private String fileType;

    @Column(name="file_uri")
    private String fileUri;

    @Column(name="file_size")
    private long fileSize;

    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonBackReference
    @OneToOne
    @JoinColumn(name="port_no")
    private Port Port;

    public Thumbnail(){

    }

    public Thumbnail(String fileName, String fileType, String fileUri, Long fileSize){
        this.fileName = fileName;
        this.fileUri = fileUri;
        this.fileType = fileType;
        this.fileSize = fileSize;
    }
}
*/
