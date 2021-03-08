package com.humorpage.sunbro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import javax.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
public class SunbroApplication {

	public static void main(String[] args) {
		SpringApplication.run(SunbroApplication.class, args);
	}

}
