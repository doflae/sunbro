package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.model.PlatformUser;
import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.service.*;
import io.swagger.annotations.ApiOperation;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.validation.Valid;

@RequiredArgsConstructor
@RestController
@RequestMapping(value = "/api/account")
public class AccountController {

    @Autowired
    private CheckDuplicateService checkDuplicateService;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private RedisTokenService redisTokenService;

    @Autowired
    private ChangeProfileService changeProfileService;

    @Autowired
    private AccountService accountService;

    @ApiOperation(value ="id중복 체크 후 이메일 전송")
    @GetMapping(value="/checkdup/id")
    CommonResult checkId(String id){
        return switch (checkDuplicateService.checkEmail(id)) {
            case 1 -> responseService.getDetailResult(true, 1, "해당 메일로 인증코드를 전송하였습니다. 메일을 확인해주세요.");
            case 2 -> responseService.getDetailResult(false, 0, "이미 사용중인 계정입니다.");
            case 3 -> responseService.getDetailResult(true, 1, "메일 전송이 완료되었습니다. 메일을 확인해주세요.");
            default -> responseService.getDetailResult(false, 0, "메일 전송에 실패하였습니다. 다시 시도해주시기 바랍니다.");
        };
    }

    @ApiOperation(value = "이메일 인증 코드 확인")
    @PostMapping(value="/checkcode")
    CommonResult checkCode(String email, String code){
        if(email!=null && code!=null){
            if(code.equals(redisTokenService.getData(email))){
                return responseService.getSuccessResult();
            }
        }
        return responseService.getFailResult();
    }



    @ApiOperation(value = "name중복 체크")
    @GetMapping(value="/checkdup/name")
    CommonResult checkName(String name, HttpServletRequest request){
        if(checkDuplicateService.checkName(name, request.getRemoteAddr())){
            return responseService.getSuccessResult();
        }
        return responseService.getFailResult();
    }

    @ApiOperation(value = "프로필 이미지 수정")
    @PostMapping(value="/update/img")
    CommonResult updateImg(String path, Authentication authentication){
        UserSimple userSimple;
        try{
            userSimple = (UserSimple) authentication.getPrincipal();
            changeProfileService.ChangeImage(userSimple,path);
            return responseService.getSuccessResult();
        }catch (Exception e){
            e.printStackTrace();
            return responseService.getFailResult();
        }
    }

    @ApiOperation(value = "회원 정보 수정")
    @PostMapping(value="/update")
    CommonResult update(@Valid @ModelAttribute UserSimple user, Authentication authentication){
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            changeProfileService.ChangeProfile(userSimple,user);
            return responseService.getSuccessResult();
        }catch (Exception e){
            return responseService.getDetailResult(false,-1,"Need to Login");
        }
    }

    @ApiOperation(value = "타 플랫폼 로그인")
    @PostMapping(value = "/pf-login")
    CommonResult pfLogin(@ModelAttribute PlatformUser platformUser,
                          HttpServletResponse res){
        return accountService.pfLogin(platformUser, res);
    }

    @ApiOperation(value = "로그인", notes = "UserSimple 엔티티로 로그인 이후 access/refresh token 생성")
    @PostMapping(value = "/login")
    CommonResult login(@RequestParam String uid,
                       @RequestParam String password,
                       @RequestParam(defaultValue = "false", required = false) Boolean keepLogin,
                       HttpServletResponse res) {
        return accountService.login(uid,password,keepLogin,res);
    }

    @ApiOperation(value = "로그아웃", notes = "refresh token access token 세션 삭제 및 cookie 만료기간 0")
    @GetMapping(value = "/logout")
    public CommonResult logout(HttpServletRequest req,
                               HttpServletResponse res){
        return accountService.logout(req,res);
    }


    /**
     * 회원가입
     * @param user 유저 폼, Valid 검사는 프론트에서 진행
     * @param isPlatForm 타 플랫폼 통해 가입한 경우 비밀번호는 무작위 부여
     * @return 성공 여부
     */
    @PostMapping(value = "/signup")
    CommonResult signup(@ModelAttribute User user,
                        @RequestParam(required = false, defaultValue = "false") boolean isPlatForm) {
        return accountService.signup(user, isPlatForm);
    }


    @ApiOperation(value = "회원 탈퇴", notes = "authentication의 정보, 입력받은 id, pw 대조하여 확인 후 유저 삭제")
    @PostMapping(value = "/delete-account")
    CommonResult deleteAccount(@RequestParam String uid,
                            @RequestParam String password,
                            Authentication authentication,
                            HttpServletResponse res,
                            HttpServletRequest req) {
        return accountService.deleteAccount(uid,password,authentication,res,req);
    }
}