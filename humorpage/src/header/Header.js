import React from 'react';
import { withRouter,useHistory} from "react-router-dom";
import { authWrapper } from '../auth/AuthWrapper';
import logo from "../static/img/logo.jpg"
import userDefaultImg from "../static/img/user_32x.png";

function Header({...props}){
  let history = useHistory();
  const Logout = () => (e) =>{
    props.signout().then(res=>{
        history.push("/boards");
      }
    )
  }
  const nowPath = history.location.pathname
  const myPush = (target) =>{
    const nowPathOrigin = nowPath.match(/^\/([^/.]*).*$/g)
    const targetPathOrigin = target.match(/^\/([^/.]*).*$/g)
    if(nowPathOrigin!=null && targetPathOrigin!=null){
      if(nowPathOrigin[1] === targetPathOrigin[1]){
        history.push(target);
        history.go();
      }
    }
    else{
      history.push(target);
    }
  }
  const imageClick = () => (e) =>{
    myPush("/boards")
  }

  const goMypage = () => (e)=>{
    myPush("/mypage")
  }

  const goLogin = () => (e) =>{
    myPush("/login")
  }
  return <header className="head">
  <div className="head_logo" onClick={imageClick()}>
    <img src={logo} className="head_logo_img" alt=""/>
    <div className="head_logo_text">Nogary</div>
  </div>
  <UserImg user={props.user} goMypage={goMypage}/>
  <LogBtn user={props.user} Logout={Logout} goLogin={goLogin}/>
  </header>
}

const UserImg = ({user, goMypage}) =>{
  if(user!=null){
    return <img className="head_user_img" onClick={goMypage()}
      alt="" src={"/file/get?name=/72"+user.userImg}
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

export default withRouter(authWrapper(Header))