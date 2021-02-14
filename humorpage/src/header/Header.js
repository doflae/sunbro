import React, {Component} from 'react';
import { withRouter,Link} from "react-router-dom";
import { authWrapper } from '../auth/AuthWrapper';
import logo from "../static/img/logo.jpg"
export const Header = withRouter(authWrapper(class extends Component{
  constructor(props){
    super(props)
  }
  componentDidMount(){
    console.log(this.props)
  }
  handleLogout = () => (e) =>{
    console.log("logout")
  }

  imageClick = () => (e) =>{
    console.log(this.props)
    //this.props.history.push("/contexts")
  }

  render = () =>
    <header className="head">
    <div className="head_logo" onClick={this.imageClick()}>
      <img src={logo} className="head_logo_img" alt="logo"/>
      <div className="head_logo_text">Nogary</div>
    </div>
    {this.props.isAuthentcated?(
      <div className="head_logout head_elem" onClick={this.handleLogout()}>Logout</div>
    ):(
      <div className="head_login head_elem"><Link to="/login">Login</Link></div>
    )}
    
    </header>
}))