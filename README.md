# 유머 커뮤니티

![JAVASCRIPT](https://img.shields.io/badge/Javascript-F7DF1E?style=plastic&logo=Javascript&logoColor=white)
![REACT](https://img.shields.io/badge/REACT-61DAFB?style=plastic&logo=REACT&logoColor=white)
![SPRING](https://img.shields.io/badge/SPRING-6DB33F?style=plastic&logo=SPRING&logoColor=white)
![REDIS](https://img.shields.io/badge/REDIS-DC382D?style=plastic&logo=REDIS&logoColor=white)
![MARIADB](https://img.shields.io/badge/MariaDB-003545?style=plastic&logo=MariaDB&logoColor=white)


페이지 이동을 최소화한 유머 커뮤니티입니다.
RestApi를 통해 Spring boot와 React를 연결하였으며 커뮤니티에서 사용할 대부분의 기능을 구현하였습니다.


자세한 이슈들은 아래 기술블로그에 정리 중입니다.


[![Tech Blog Badge](http://img.shields.io/badge/-Tech%20blog-black?style=flat-square&logo=github&link=https://fri-seono.tistory.com/)](https://fri-seono.tistory.com/)

아래의 사진을 클릭하여 시연 동영상을 볼 수 있습니다.

[![Video Label](https://user-images.githubusercontent.com/47937302/113028395-2e396e80-91c6-11eb-9cc9-7bdadda7ca82.png)](https://youtu.be/qTR4-21yZHU)


### 개발 환경

프로젝트 개발 환경은 다음과 같습니다.

* IDE : IntelliJ IDEA
* OS : Window 10
* SpringBoot 2.4.0
* Jdk15
* Maven
* React : 16.14.0
* Redis : 3.2.100
* MariaDB : 10.5

추가 외부프로그램은 FFMpeg을 사용하였습니다.

### 외부 설정 파일

외부 설정 파일에서 다음 설정 파일은 추가로 작성해야 합니다.

```
//application.properties
spring.datasource.username=
spring.datasource.password=
spring.datasource.url=jdbc:log4jdbc:mariadb://localhost:3306/mydb?autoReconnect=true&useUnicode=true&characterEncoding=utf8&serverTimezone=UTC
spring.datasource.driver-class-name=net.sf.log4jdbc.sql.jdbcapi.DriverSpy
spring.servlet.multipart.max-file-size=200MB
spring.servlet.multipart.max-request-size=215MB
spring.cache.type = redis
spring.redis.host = 127.0.0.1
spring.redis.port = 6379
spring.jwt.secret = 

//mail.properties
mail.smtp.auth=true
mail.smtp.starttls.required=true
mail.smtp.starttls.enable=true
mail.smtp.socketFactory.class=javax.net.ssl.SSLSocketFactory
mail.smtp.socketFactory.fallback=false
mail.smtp.port=465
mail.smtp.socketFactory.port=465

#admin 구글 아이디 계정 id,password
AdminMail.id = 
AdminMail.password = 

//ffmpeg.properties
video.ffmpeg.path = ffmpeg.exe 경로
video.ffprobe.path = ffprobe.exe 경로

```

### DB 설정

최상단 디렉토리에 있는 sql 파일을 이용하여 사용 가능합니다.





