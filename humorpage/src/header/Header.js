import React, {Component} from 'react';
import { withRouter,Link} from "react-router-dom";
import { authWrapper } from '../auth/AuthWrapper';
import logo from "../static/img/logo.jpg"
import userImg from "../static/img/user_default.png";
class Header extends Component{
  handleLogout = () => (e) =>{
      this.props.signout().then(res=>{
        this.props.history.push("/boards");
      }
    )
  }

  imageClick = () => (e) =>{
    this.props.history.push("/boards")
    this.props.history.go();
  }
  test = () => (e)=>{
    this.props.history.push("/mypage")
    this.props.history.go();
  }

  render = () =>
    <header className="head">
    <div className="head_logo" onClick={this.imageClick()}>
      <img src={logo} className="head_logo_img" alt=""/>
      <div className="head_logo_text">Nogary</div>
    </div>
    <img className="head_user_img" onClick={this.test()} src={userImg} alt=""/>
    {this.props.user!==null?(
      <div className="head_sign" onClick={this.handleLogout()}>Logout</div>
    ):(
      <div className="head_sign"><Link to="/login">Login</Link></div>
    )}
    
    </header>
}
export default withRouter(authWrapper(Header))