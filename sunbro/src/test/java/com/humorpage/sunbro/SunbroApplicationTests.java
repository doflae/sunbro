package com.humorpage.sunbro;

import com.humorpage.sunbro.service.RedisTokenService;
import com.humorpage.sunbro.utils.GifUtils.GifUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.test.context.SpringBootTest;

import javax.mail.Message;
import javax.mail.Session;
import javax.mail.Transport;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.io.File;
import java.util.Properties;

@SpringBootTest
class SunbroApplicationTests {

	@Autowired
	RedisTokenService redisTokenService;

	public static void main(String[] args) throws Exception {
		File file = new File("C://mediaFiles/test2.gif");
		File newFile = new File("C://mediaFiles/test3.gif");
		GifUtil.gifInputToOutput(file,newFile,72);
	}

}
