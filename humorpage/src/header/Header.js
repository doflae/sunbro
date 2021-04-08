import React, { useEffect, useState } from 'react';
import { withRouter,useHistory} from "react-router-dom";
import { authWrapper } from '../auth/AuthWrapper';
import logo from "../static/img/logo.jpg"
import Search from "../static/svg/search.svg"
import styled from "styled-components";

function Header({...props}){
  let history = useHistory();
  const [user,setUser] = useState(props.user);
  const Logout = () => (e) =>{
    props.signout()
  }
  const imageClick = () => (e) =>{
    history.push("/boards")
  }
  const goLogin = () => (e) =>{
    props.setPageOption(0);
  }
  useEffect(()=>{
    setUser(props.user);
  },[props.user,user])

  return <HeadStyled>
  <HeadLogoStyled onClick={imageClick()}>
    <HeadLogoImgStyled src={logo} alt=""/>
  </HeadLogoStyled>
  <SearchZoneStyled>
    <SearchInputStyled type="text" className="search-input"></SearchInputStyled>
    <SearchStyled width="30px" height="30"/>
  </SearchZoneStyled>
  <LogBtn user = {user} Logout = {Logout} goLogin = {goLogin}/>
  </HeadStyled>
}

const LogBtn = ({user, Logout, goLogin}) =>{
  if(user!=null){
    return <SignBtnStyled onClick={Logout()}>로그아웃</SignBtnStyled>
  }else{
    return <SignBtnStyled onClick={goLogin()}>로그인</SignBtnStyled>
  }
}

const SearchZoneStyled = styled.div`
  background-color: #dfdede;
  line-height: 200%;
  width: 50%;
  max-width:500px;
  border-radius: 7px;
  margin-top: 5px;
  margin-bottom: 5px;
  display: flex;
`

const SearchInputStyled = styled.input`
  background-color: #dfdede;
	border-radius: 7px;
	border: 0px;
	width: 100%;
	padding-left: 20px;
  &:focus{
	  outline: none;
  }
`


const SignBtnStyled = styled.div`
  text-align: center;
  line-height: 200%;
  border-radius: 5px;
  font-size:1.1em;
  font-weight:800;
  background-color: #ec4646;
  color:#ffffff;
  width: 80px;
  cursor: pointer;
  height: 80%;
  margin-right: 10px;
  margin-left: 10px;
  margin-top: auto;
  margin-bottom: auto;
`

const SearchStyled = styled(Search)`
  cursor: pointer;
  margin-bottom: auto;
  margin-top: auto;
  margin-right: 10px;
  opacity: 0.2;
  &:hover{
    opacity: 0.7;
  }
`

const HeadLogoImgStyled = styled.img`
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 20px;
  margin-right: 5px;
  margin-top: 5px;
`

const HeadLogoStyled = styled.div`
  line-height: 250%;
  height: 100%;
  font-size: 1.2rem;
  margin-left:30px;
  font-weight: 800;
`

const HeadStyled = styled.header`
  z-index:1;
  width: 100%;
  max-height: 50px;
  background-color : #fff;
  border-bottom: solid 1px rgb(0 0 0 / 36%);
  display: flex;
  min-width:500px;
  flex-direction: row;
  justify-content: space-between;
  position:fixed;
`

export default withRouter(authWrapper(Header))