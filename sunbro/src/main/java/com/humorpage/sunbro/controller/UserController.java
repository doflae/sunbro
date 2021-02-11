package com.humorpage.sunbro.controller;

import com.humorpage.sunbro.model.User;
import com.humorpage.sunbro.model.UserSimple;
import com.humorpage.sunbro.respository.UserSimpleRepository;
import com.humorpage.sunbro.service.JwtTokenService;
import com.humorpage.sunbro.respository.UserRepository;
import com.humorpage.sunbro.result.CommonResult;
import com.humorpage.sunbro.result.ListResult;
import com.humorpage.sunbro.result.SingleResult;
import com.humorpage.sunbro.service.ResponseService;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.validation.BindingResult;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import javax.validation.Valid;

@RequiredArgsConstructor
@RestController
@RequestMapping("/user")
class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private UserSimpleRepository userSimpleRepository;
    @Autowired
    private JwtTokenService jwtTokenService;

    @Autowired
    private ResponseService responseService;

    @Autowired
    private PasswordEncoder passwordEncoder;


    @ApiOperation(value = "회원 단건 조회", notes = "usernum으로 회원을 조회한다")
    @GetMapping(value = "/{usernum}")
    public SingleResult<User> findUserById(@ApiParam(value = "msrl", required = true) @PathVariable Long usernum) {
        return responseService.getSingleResult(userRepository.findById(usernum).orElse(null));
    }


//    @ApiOperation(value = "회원 수정", notes = "회원정보를 수정한다")
//    @PostMapping(value = "/modify")
//    public SingleResult<User> modify(@Valid User user, BindingResult bindingResult, Authentication authentication) {
//        UserSimple userSimple = (UserSimple) authentication.getPrincipal();
//
//        User user = User.builder()
//                .usernum(usernum)
//                .uid(uid)
//                .enabled(true)
//                .build();
//        return responseService.getSingleResult(repository.save(user));
//    }

    @ApiOperation(value = "회원 탈퇴", notes = "authentication의 정보, 입력받은 id, pw 대조하여 확인 후 유저 삭제")
    @PostMapping(value = "/delete")
    public CommonResult delete(@ApiParam(value = "id",required = true)@RequestParam String uid,
                               @ApiParam(value = "pw", required = true)@RequestParam String password,
                               Authentication authentication) {
        try{
            UserSimple userSimple = (UserSimple) authentication.getPrincipal();
            if (!userSimple.getUid().equals(uid)){
                return responseService.getFailResult();
            }
            if (!passwordEncoder.matches(password,userSimple.getPassword())){
                return responseService.getFailResult();
            }
            userSimpleRepository.delete(userSimple);
            return responseService.getSuccessResult();
        }catch (Exception e){
            return responseService.getFailResult();
        }
    }

}