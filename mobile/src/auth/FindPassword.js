import React, { useRef, useState } from "react";
import {authWrapper} from "./AuthWrapper";
import {ValidationSuccess} from "../forms/ValidationSuccess"
import styled from "styled-components";
import {FormInputControlStyled} from "../forms/LoginForm";
import {FormLabelStyled} from "../forms/SignupForm";

export const FindPassword = authWrapper(({...props}) =>{
    let emailRef = useRef();
    const [validationEmail, setValidationEmail] = useState(null);
    const findPassword = ()=>(e) =>{
        console.log(emailRef.current.value);
        //todo Backend에 기능 추가 후 연결
        setValidationEmail("임시 비밀번호를 전송하였습니다. 이메일을 확인해주세요.");
    }
    const goToLogin = () => (e) =>{
        props.setAuthPageOption(0);
    }
    return <div>
        <FormLabelStyled>아이디</FormLabelStyled>
        <FormInputControlStyled
            theme={{width:"100%"}}
            type = "email" name = "email" ref = {emailRef}
            placeholder="이메일을 입력해주세요."/>
        <FindPwBtnStyled onClick={findPassword()}>비밀번호 찾기</FindPwBtnStyled>
        <ValidationSuccess success = {validationEmail}/>
        <LoginBtnStyled onClick={goToLogin()}> 뒤로 가기</LoginBtnStyled>
    </div>
})

const LoginBtnStyled = styled.div`
    text-align: center;
	margin-top:5px;
	border-radius: 5px;
	margin-bottom: 5px;
	padding: 5px;
	font-size: 1.1em;
	font-weight: 800;
	cursor: pointer;
	background-color: #ec4646;
	color: #ffffff;
`

const FindPwBtnStyled = styled.div`
    width: fit-content;
    text-align: center;
    margin-top: 5px;
    border-radius: 5px;
    margin-bottom: 5px;
    padding: 5px;
    font-size: 1.1em;
    border: 1px solid;
    opacity: 0.3;
    font-weight: 800;
    cursor: pointer;
`