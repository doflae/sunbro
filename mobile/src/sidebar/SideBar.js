import React, { useEffect, useState } from 'react';
import styled from "styled-components";
import {authWrapper} from "../auth/AuthWrapper";
import MyPage from "../mypage/MyPage"

export const SideBar = ({...props}) =>{
    return <SideBarStyled
    ref={props.myMenuBtnRef}>
        <CloseBtnStyled
            onClick={(e)=>{e.preventDefault(); 
            e.target.parentElement.style.width="0"}}
        >
            Close
        </CloseBtnStyled>
        <UserBox/>
        <BottomBox/>
    </SideBarStyled>
}

const UserBox = authWrapper(({...props})=>{
    const [user, setUser] = useState(props.user==null?null:props.user);
    useEffect(()=>{
        setUser(props.user);
    },[props.user])
    if (user==null){
        return <LoginBtnStyled
            onClick={(e)=>{e.preventDefault();
                e.target.parentElement.style.width="0";
                props.setAuthPageOption(0);}}
        >
            Login
        </LoginBtnStyled>
    }
    return <React.Fragment>
        <UserBoxStyled>
        <MyPage/>
        </UserBoxStyled>
        </React.Fragment>
})

const BottomBox = authWrapper(({...props}) =>{
    return <AdminBoxStyled>
        {props.user ? <LogoutBtnStyled
        onClick={props.logout}>
            로그아웃
        </LogoutBtnStyled>:null}
        광고 문의 <br/> doflae@naver.com
        <br/>
        <br/>
        Copyright 2021. Nogary
        <br/>
        All Rights Reserved 
        </AdminBoxStyled>
})

const LogoutBtnStyled = styled.div`
    font-size: 12px;
    cursor: pointer;
    padding: 3px;
    color: #ffffff;
    background-color: red;
    font-weight: 600;
    width: 70%;
    margin: 0px auto 5px auto;
    text-align: center;
    border-radius: 10px;
    border-bottom: 1px solid rgba(94,93,93,0.418);
    box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
`

const LoginBtnStyled = styled.div`
    font-size:16px;
    color:red;
    font-weight:800;
    width:70%;
    padding:10px;
`

const CloseBtnStyled = styled.div`
    font-size: 16px;
    padding: 8px;
    font-weight: 800;
    cursor:pointer;
    &:hover{
        background-color:rgb(0,0,0,0.24);
    }
`

const SideBarStyled = styled.div`
    position: absolute;
    z-index: 2;
    overflow-x: hidden;
    transition:0.3s ease-in-out;
    height: 100%;
    background-color:#fff;
    width: 0px;
    top: 0;
    right: 0;
`

const UserBoxStyled = styled.div`
    width: 100%;
    background-color: #fff;
`
const AdminBoxStyled = styled.div`
    height: -webkit-fit-content;
    height: -moz-fit-content;
    height: fit-content;
    font-size: 10px;
    padding: 10px;
    position: absolute;
    bottom: 0px;
    color: rgb(0,0,0,0.8);
    box-sizing: border-box;
    width: 100%;
    font-weight: 500;
`