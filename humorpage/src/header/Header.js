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
  const imageClick = () => (e) =>{
    history.push("/boards")
    history.go();
  }

  const goMypage = () => (e)=>{
    history.push("/mypage")
    history.go();
  }

  const goLogin = () => (e) =>{
    history.push("/login")
    history.go();
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