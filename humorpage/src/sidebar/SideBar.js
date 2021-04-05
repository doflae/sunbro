import React, { useEffect, useState,useRef } from 'react';
import styled from "styled-components";
import {authWrapper} from "../auth/AuthWrapper";

export const SideBar = () =>{
    let sidebarRef = useRef();
    useEffect(()=>{
        function StickSideBarTop(){
            sidebarRef.current.style.marginTop = `${document.scrollingElement.scrollTop}px`
        }
        window.addEventListener('scroll',StickSideBarTop)
        return () =>{
            window.removeEventListener('scroll',StickSideBarTop);
        }
    });
    return <SideBarStyled ref={sidebarRef}>
        <UserBox/>
        <AdminBox/>
        <AdsBox/>
    </SideBarStyled>
}

const UserBox = authWrapper(({...props})=>{
    const [user, setUser] = useState(props.user==null?null:props.user);
    useEffect(()=>{
        setUser(props.user);
    },props.user)
    return <UserBoxStyled>{user}</UserBoxStyled>
})

const AdminBox = () =>{
    return <AdminBoxStyled>광고 문의 <br/> doflae@naver.com </AdminBoxStyled>
}

const AdsBox = () =>{
    return <AdsBoxStyled/>
}

const SideBarStyled = styled.div`
    width: 40%;
`

const UserBoxStyled = styled.div`
    height:300px;
    max-width: 300px;
    border-radius:10px;
    margin-left:20px;
    background-color: #fff;
    border-bottom: 1px solid rgba(94,93,93,0.418);
    box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
`

const AdsBoxStyled = styled.div`
    margin-top:20px;
    height:400px;
    max-width: 300px;
    margin-left:20px;
    border-radius:10px;
    background-color: #fff;
    border-bottom: 1px solid rgba(94,93,93,0.418);
    box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
`

const AdminBoxStyled = styled.div`
    padding:30px;
    box-sizing:border-box;
    max-width: 300px;
    margin-top:20px;
    margin-left:20px;
    height:100px;
    border-radius:10px;
    background-color: #fff;
    border-bottom: 1px solid rgba(94,93,93,0.418);
    box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
`