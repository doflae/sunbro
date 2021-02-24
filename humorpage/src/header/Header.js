import React, {Component} from 'react';
import { withRouter,Link} from "react-router-dom";
import { authWrapper } from '../auth/AuthWrapper';
import logo from "../static/img/logo.jpg"
export const Header = withRouter(authWrapper(class extends Component{
  constructor(props){
    super(props)
    this.state={
      user:null,
    }
  }
  handleLogout = () => (e) =>{
    this.props.signout();
  }

  imageClick = () => (e) =>{
    console.log(this.props)
    this.props.history.push("/boards")
  }

  render = () =>
    <header className="head">
    <div className="head_logo" onClick={this.imageClick()}>
      <img src={logo} className="head_logo_img" alt="logo"/>
      <div className="head_logo_text">Nogary</div>
    </div>
    {this.props.user!==null?(
      <div className="head_sign" onClick={this.handleLogout()}>Logout</div>
    ):(
      <div className="head_sign"><Link to="/login">Login</Link></div>
    )}
    
    </header>
}))