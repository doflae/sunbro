import React, { Component } from 'react';
import './static/css/Normalize.css'
import './static/css/App.css';
import './static/css/Board.css'
import './static/css/Comment.css'
import "react-quill/dist/quill.snow.css"
import './static/css/Editor.css'
import './static/css/Mypage.css'
import {Route, Switch} from "react-router-dom"
import BoardConnector from "./board/BoardConnector"
import Upload from "./upload/Upload"
import Update from "./upload/Update"
import Header from "./header/Header"
import {Login} from "./auth/Login"
import {Provider} from "react-redux"
import {HumorDataStore} from "./data/DataStore"
import UserPage from "./userpage/UserPage"
import BoardSingleConnector from './board/BoardSingleConnector';
import styled from 'styled-components';
import {SideBar} from "./sidebar/SideBar";

class App extends Component{
  render(){
    return<Provider store = {HumorDataStore}>
            <AppStyled>
              <Header/>
            <Switch>
              <MainBoxStyled>
                <BoardBoxStyled>
                <Route exact path="/" component={BoardConnector}/>
                <Route path="/upload" component={Upload}/>
                <Route path="/boards" component={BoardConnector}/>
                <Route path="/update/:key" component={Update}/>
                <Route path="/userpage/:key" component={UserPage}/>
                <Route path="/board/:key" component={BoardSingleConnector}/>
                </BoardBoxStyled>
                <Login/>
                <SideBar/>
              </MainBoxStyled>
            </Switch>
          </AppStyled>
          </Provider>
  }
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