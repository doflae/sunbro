package com.humorpage.sunbro;

import com.humorpage.sunbro.filter.JwtAuthenticationFilter;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.annotation.Bean;

import javax.annotation.PostConstruct;
import java.util.TimeZone;

@SpringBootApplication
public class SunbroApplication {

	public static void main(String[] args) {
		SpringApplication.run(SunbroApplication.class, args);
	}

	@Bean
	public FilterRegistrationBean registration(JwtAuthenticationFilter filter){
		FilterRegistrationBean registrationBean = new FilterRegistrationBean(filter);
		registrationBean.setEnabled(false);
		return registrationBean;
	}
}
