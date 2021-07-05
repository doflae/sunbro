import React from 'react';
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
import BoardSingleConnector from './board/BoardSingleConnector';
import styled from 'styled-components';
import {SideBar} from "./sidebar/SideBar";

const App = () =>{
  return (
        <React.Fragment>
          <AppStyled>
              <Header/>
            <Switch>
              <MainBoxStyled>
                <BoardBoxStyled>
                <Route exact path="/" component={BoardConnector}/>
                <Route path="/userpage/:key" component={BoardConnector}/>
                <Route path="/board/:key" component={BoardSingleConnector}/>
                </BoardBoxStyled>
                <Login/>
                <SideBar/>
              </MainBoxStyled>
            </Switch>
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
  min-width: 700px;
  min-height: 100vh;
  width:100%;
  margin-left: auto;
  margin-right: auto;
  background-color: #dfdede;
`

const BoardBoxStyled = styled.div`
  margin-left:auto;
  width:70%;
`

const MainBoxStyled = styled.div`
  margin-bottom: 50px;
  background-color: #dfdede;
  padding-top: 60px;
  margin-left: auto;
  margin-right: auto;
  display:flex;
`

export default App;