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
import Footer from "./footer/Footer"
import Upload from "./upload/Upload"
import Update from "./upload/Update"
import Header from "./header/Header"
import {Login} from "./auth/Login"
import {Provider} from "react-redux"
import {HumorDataStore} from "./data/DataStore"
import MyPage from "./mypage/MyPage";
import UserPage from "./userpage/UserPage"
import {Signup} from "./auth/Signup"
import BoardSingleConnector from './board/BoardSingleConnector';
import styled from 'styled-components';


class App extends Component{
  render(){
    return<Provider store = {HumorDataStore}>
            <div className="App">
              <Header/>
            <Switch>
              <MainBoxStyled>
                <Route exact path="/" component={BoardConnector}/>
                <Route path="/upload" component={Upload}/>
                <Route path="/login" component={Login}/>
                <Route path="/boards" component={BoardConnector}/>
                <Route path="/mypage" component={MyPage}/>
                <Route path="/signup" component={Signup}/>
                <Route path="/update/:key" component={Update}/>
                <Route path="/userpage/:key" component={UserPage}/>
                <Route path="/board/:key" component={BoardSingleConnector}/>
              </MainBoxStyled>
            </Switch>
            <Footer/>
          </div>
          </Provider>
  }
}

const MainBoxStyled = styled.div`
  margin-bottom:50px;
`

export default App;