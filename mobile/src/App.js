import React,{useRef} from 'react';
import './static/css/Normalize.css'
import './static/css/App.css';
import './static/css/Board.css'
import './static/css/Comment.css'
import './static/css/Nogari.css'
import "react-quill/dist/quill.snow.css"
import './static/css/Editor.css'
import './static/css/Mypage.css'
import {Route, Switch} from "react-router-dom"
import BoardConnector from "./board/BoardConnector"
import UploadConnector from "./upload/UploadConnector"
import Header from "./header/Header"
import {Login} from "./auth/Login"
import {SideBar} from "./sidebar/SideBar"
import UserPage from "./userpage/UserPage"
import BoardSingleConnector from './board/BoardSingleConnector';
import styled from 'styled-components';

const App = () =>{
  const myMenuBtnRef = useRef();
  return (
        <React.Fragment>
          <AppStyled>
            <Header myMenuBtnRef={myMenuBtnRef}/>
            <Switch>
              <MainBoxStyled>
                <BoardBoxStyled>
                <Route exact path="/" component={BoardConnector}/>
                <Route path="/userpage/:key" component={UserPage}/>
                <Route path="/board/:key" component={BoardSingleConnector}/>
                </BoardBoxStyled>
                <Login/>
              </MainBoxStyled>
            </Switch>
            <SideBar myMenuBtnRef={myMenuBtnRef}/>
          </AppStyled>
          <UploadConnector/>
          </React.Fragment>
  )
}

Math.ceil10 = (value,exp) =>{
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math['ceil'](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  value = value.toString().split('e');
  value = Math['ceil'](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}


const AppStyled = styled.div`
  height:100%;
  width:100%;
  background-color: #dfdede;
`

const BoardBoxStyled = styled.div`
  width:100%;
`

const MainBoxStyled = styled.div`
  margin-bottom: 50px;
  background-color: #dfdede;
  padding-top: 48px;
  display:flex;
`

export default App;