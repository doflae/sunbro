package com.humorpage.sunbro.service;


import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import javax.mail.Message;
import javax.mail.MessagingException;
import javax.mail.internet.InternetAddress;
import javax.mail.internet.MimeMessage;
import java.text.SimpleDateFormat;
import java.util.Date;

@Service
public class EmailAuthService {

    @Autowired
    private JavaMailSender mailSender;

    private final SimpleDateFormat emailTimeFormat = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");

    @Autowired
    private RedisTokenService redisTokenService;


    private String getMailcontent(String email, String key, String expires){
        return "<h4> <h3>Nogary</h3> 회원가입을 위한 본인 확인 메일 입니다.</h4><br/><br/>\n" +
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

    }

    //redis에 expire time 정해서 보냄
    public String sendMailwithKey(String email) throws MessagingException{
        String key = FileUploadService.RandomnameGenerate(8);
        //redis에서 해당 email을 키값으로 가진 데이터 있는지 확인
        boolean hasEmailSend = Boolean.parseBoolean(redisTokenService.getData(email));
        if(hasEmailSend){
            //메일 전송 확인 메세지 반송
            return "메일 전송이 완료되었습니다. 메일을 확인해주세요.";
        }else{
            try{
                MimeMessage message = mailSender.createMimeMessage();
                redisTokenService.setDataExpire(email,String.valueOf(true),JwtTokenService.EmailAuthValidMilisecond);
                message.setSubject("[Nogary] 가입 인증 메일입니다.");
                Date expires = new Date(System.currentTimeMillis()+3600*2*1000);
                message.setText(getMailcontent(email,key,emailTimeFormat.format(expires)),"utf-8","html");
                message.addRecipient(Message.RecipientType.TO,new InternetAddress(email));
                mailSender.send(message);
                return "해당 메일로 인증코드를 전송하였습니다. 메일을 확인해주세요.";
            }catch (MessagingException e){
                e.printStackTrace();
                redisTokenService.setDataExpire(email,String.valueOf(true),0);//토큰삭제
                throw e;
            }
        }
    }
}
