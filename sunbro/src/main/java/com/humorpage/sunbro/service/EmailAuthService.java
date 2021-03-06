package com.humorpage.sunbro.service;

import com.humorpage.sunbro.utils.RandomGenerator;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import javax.mail.Message;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class EmailAuthService {

    @Autowired
    private JavaMailSender emailSender;

    private final SimpleDateFormat emailTimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private RedisTokenService redisTokenService;


    private MimeMessage createAuthMessage(String email, String key, String expires) throws Exception {
        String content = "<h4> <h3>Nogary</h3> 회원가입을 위한 본인 확인 메일 입니다.</h4>\n" +
                "\n" +
                "\t<h3> 안녕하십니까. Nogary 입니다.</h3>\n" +
                "    <h3> 본인 확인을 위하여 아래의 ID 및 인증 번호를 확인하신 후, 회원 가입 창에 입력하여 주시기바랍니다.</h3>\n" +
                "\n" +
                "    <p><label style=\"font-size:20px; font-weight:800\">ID : <input type=\"text\" value=\""+
                email+
                "\" style=\"font-size:20px; font-weight:800\" disabled></input><label></p>\n" +
                "    <p stlye=\"margin-top:10px\"><label style=\"font-size:20px; font-weight:800\">인증 코드 : <input type=\"text\" value=\""+
                key+
                "\" style=\"font-size:20px; font-weight:800\" disabled></input><label></p>\n" +
                "\n" +
                "    <h4> 해당 코드의 인증 만료 시간은 <span style=\"font-size:20px; font-weight:800\">"+
                expires+
                "</span> 입니다. </h4>";

        MimeMessage message = emailSender.createMimeMessage();
        message.addRecipient(Message.RecipientType.TO, new InternetAddress(email));
        message.setSubject("[Nogary] 가입 인증 메일입니다.");
        message.setFrom(new InternetAddress("nogarypeople@gmail.com", "NogaryMaster"));
        message.setText(content,"utf-8","html");
        return message;
    }

    //redis에 expire time 정해서 보냄
    @Async("emailAuthExecutor")
    public void sendMailwithKey(String email) throws Exception{
        String key;
        key = redisTokenService.getData(email);
        if(key==null){
            key = RandomGenerator.randomNameGenerate(8);
            try{
                redisTokenService.setDataExpire(email,key,JwtTokenService.EmailAuthValidSecond);
                Date expires = new Date(System.currentTimeMillis()+JwtTokenService.EmailAuthValidMiliSecond);
                MimeMessage message = createAuthMessage(email,key,emailTimeFormat.format(expires));
                emailSender.send(message);
            }catch (Exception e){
                e.printStackTrace();
                redisTokenService.deleteData(email);
                throw e;
            }
        }
    }
}
