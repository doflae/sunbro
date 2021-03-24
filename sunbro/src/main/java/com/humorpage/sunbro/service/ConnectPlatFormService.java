package com.humorpage.sunbro.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.humorpage.sunbro.model.OtherUser;
import org.json.simple.JSONObject;
import org.json.simple.parser.JSONParser;
import org.json.simple.parser.ParseException;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
public class ConnectPlatFormService {

    public boolean AuthByPlatform(OtherUser otherUser){
        switch (otherUser.getPlatForm()){
            case KAKAO-> {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization","Bearer "+otherUser.getToken());
                HttpEntity<String> entity = new HttpEntity<>("parameters",headers);
                URI uri = URI.create("https://kapi.kakao.com/v1/user/access_token_info");
                ResponseEntity<String> responseEntity = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
                if(responseEntity.getStatusCode()== HttpStatus.OK){
                    JSONParser jsonParser = new JSONParser();
                    try{
                        JSONObject jsonObject = (JSONObject) jsonParser.parse(responseEntity.getBody());
                        return jsonObject.getOrDefault("id","").toString().equals(otherUser.getUid());
                    }catch (ParseException e){
                        e.printStackTrace();
                    }
                }
            }
            case NAVER -> {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                headers.set("Authorization","Bearer "+otherUser.getToken());
                HttpEntity<String> entity = new HttpEntity<>("parameters",headers);
                URI uri = URI.create("https://openapi.naver.com/v1/nid/me");
                ResponseEntity<String> responseEntity = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
                if(responseEntity.getStatusCode()== HttpStatus.OK){
                    JSONParser jsonParser = new JSONParser();
                    try{
                        JSONObject jsonObject = (JSONObject) jsonParser.parse(responseEntity.getBody());
                        return jsonObject.getOrDefault("id","").toString().equals(otherUser.getUid());
                    }catch (ParseException e){
                        e.printStackTrace();
                    }
                }
            }
            case GOOGLE -> {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                HttpEntity<String> entity = new HttpEntity<>("parameters",headers);
                URI uri = URI.create("https://www.googleapis.com/oauth2/v1/tokeninfo?access_token="+otherUser.getToken());
                ResponseEntity<String> responseEntity = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
                if(responseEntity.getStatusCode()== HttpStatus.OK){
                    JSONParser jsonParser = new JSONParser();
                    try{
                        JSONObject jsonObject = (JSONObject) jsonParser.parse(responseEntity.getBody());
                        return jsonObject.getOrDefault("user_id","").toString().equals(otherUser.getUid());
                    }catch (ParseException e){
                        e.printStackTrace();
                    }
                }
            }
            case FACEBOOK -> {
                RestTemplate restTemplate = new RestTemplate();
                HttpHeaders headers = new HttpHeaders();
                HttpEntity<String> entity = new HttpEntity<>("parameters",headers);
                URI uri = URI.create("https://graph.facebook.com/me?access_token="+otherUser.getToken());
                System.out.println(otherUser.toString());
                ResponseEntity<String> responseEntity = restTemplate.exchange(uri, HttpMethod.GET, entity, String.class);
                if(responseEntity.getStatusCode()== HttpStatus.OK){
                    JSONParser jsonParser = new JSONParser();
                    try{
                        JSONObject jsonObject = (JSONObject) jsonParser.parse(responseEntity.getBody());
                        return jsonObject.getOrDefault("id","").toString().equals(otherUser.getUid());
                    }catch (ParseException e){
                        e.printStackTrace();
                    }
                }
            }
            default -> {
                return false;
            }
        }
        return false;
    }
}
