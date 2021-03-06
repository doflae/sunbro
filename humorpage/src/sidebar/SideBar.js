import React, { useEffect, useState,useRef } from 'react';
import styled from "styled-components";
import {authWrapper} from "../auth/AuthWrapper";
import MyPage from "../mypage/MyPage"

export const SideBar = () =>{
    let sidebarRef = useRef(null);
    // useEffect(()=>{
    //     function StickSideBarTop(){
    //         sidebarRef.current.style.marginTop = `${document.scrollingElement.scrollTop}px`
    //     }
    //     window.addEventListener('scroll',StickSideBarTop)
    //     return () =>{
    //         window.removeEventListener('scroll',StickSideBarTop);
    //     }
    // });
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
    },[props.user])
    if (user==null) return null;
    return <UserBoxStyled>
        <MyPage/>
        </UserBoxStyled>
})

const AdminBox = () =>{
    return <AdminBoxStyled>광고 문의 <br/> doflae@naver.com </AdminBoxStyled>
}

const AdsBox = () =>{
    return <AdsBoxStyled/>
}

//TODO: 사이드바 광고 위치 조정
const SideBarStyled = styled.div`
    position: sticky;
    top: 60px;
    height: fit-content;
    width: 40%;
    padding-left:1%;
`

const UserBoxStyled = styled.div`
    width: 300px;
    border-radius:10px;
    background-color: #fff;
    border-bottom: 1px solid rgba(94,93,93,0.418);
    box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
`

const AdsBoxStyled = styled.div`
    margin-top:20px;
    height:400px;
    width: 300px;
    border-radius:10px;
    background-color: #fff;
    border-bottom: 1px solid rgba(94,93,93,0.418);
    box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
`

const AdminBoxStyled = styled.div`
    padding:30px;
    box-sizing:border-box;
    width: 300px;
    margin-top:20px;
    height:100px;
    border-radius:10px;
    background-color: #fff;
    border-bottom: 1px solid rgba(94,93,93,0.418);
    box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
`