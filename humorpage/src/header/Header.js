import React from 'react';
import { useHistory,Link } from "react-router-dom";
import logo from "../static/img/logo.jpg"


function Header() {
  let history = useHistory();
  function imageClick(){
    history.push("/contexts");
  }
  return (
    <header className="head">
      <p className="head_logo" onClick={imageClick}>
        <img src={logo} className="head_logo_img" alt="logo"/>
        <p className="head_logo_text"><Link to="/contexts">Nogary</Link></p>
         </p>
      <p className="head_login head_elem"><Link to="/login"> Login </Link></p>
    </header>
  )
}

export default Header;