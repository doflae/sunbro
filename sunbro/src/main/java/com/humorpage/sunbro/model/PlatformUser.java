package com.humorpage.sunbro.model;

import lombok.Data;

@Data
public class PlatformUser {
    private String uid;
    private PlatForm platForm;
    private String token;
}
