import React from 'react';
import './static/css/Normalize.css'
import './static/css/App.css';
import './static/css/Board.css'
import './static/css/Comment.css'
import "react-quill/dist/quill.snow.css"
import './static/css/Editor.css'
import './static/css/Mypage.css'
import {Route, Switch} from "react-router-dom"
import BoardConnector from "./board/BoardConnector"
import UploadConnector from "./upload/UploadConnector"
import Header from "./header/Header"
import {Login} from "./auth/Login"
import UserPage from "./userpage/UserPage"
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
                <Route path="/userpage/:key" component={UserPage}/>
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