import React from 'react';
import { withRouter,useHistory} from "react-router-dom";
import { authWrapper } from '../auth/AuthWrapper';
import logo from "../static/img/logo.jpg"
import userDefaultImg from "../static/img/user_32x.png";
import styled from "styled-components";

function Header({...props}){
  let history = useHistory();
  const Logout = () => (e) =>{
    props.signout().then(res=>{
        history.push("/boards");
      }
    )
  }
  const imageClick = () => (e) =>{
    history.push("/boards")
  }

  const goMypage = () => (e)=>{
    history.push("/mypage")
  }

  const goLogin = () => (e) =>{
    history.push("/login")
  }

  const itemAlignBtnRender = () => {

  }

  return <header className="head">
  <div className="head_logo" onClick={imageClick()}>
    <img src={logo} className="head_logo_img" alt=""/>
  </div>
    <div><button>hi</button></div>
  <UserImg user={props.user} goMypage={goMypage}/>
  </header>
}

const UserImg = ({user, goMypage}) =>{
  if(user!=null){
    return <img className="head_user_img" onClick={goMypage()}
      alt="" src={"/api/file/get?name=/72"+user.userImg}
      onError={e=>{
        e.target.onerror=null; e.target.src=userDefaultImg;
      }}/>
  }
  return <img className="head_user_img" onClick={goMypage()}
    alt="" src={userDefaultImg}/>
}

const LogBtn = ({user, Logout, goLogin}) =>{
  if(user!=null){
    return <div className="head_sign" onClick={Logout()}>Logout</div>
  }else{
    return <div className="head_sign" onClick={goLogin()}>Login</div>
  }
}

const HeadLogoImgStyled = styled.img`
  cursor: pointer;
  max-width: 40px;
  max-height: 40px;
  border-radius: 20px;
  margin-right: 5px;
  margin-top: 5px;
`

const HeadLogoStyled = styled.div`
  display: flex;
  margin-right: auto;
  line-height: 250%;
  height: 100%;
  margin-left: 10px;
  font-size: 1.2rem;
  font-weight: 800;
`

const HeadStyled = styled.header`
	width: 100%;
	max-height: 50px;
	background-color: #dfdede;
	border-bottom: solid rgb(190, 190, 190) 1px;
	display: flex;
	flex-direction: row;
`

export default withRouter(authWrapper(Header))