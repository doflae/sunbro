import React, { Component } from 'react';
import './static/css/Normalize.css'
import './static/css/App.css';
import './static/css/Board.css'
import './static/css/Comment.css'
import "react-quill/dist/quill.snow.css"
import './static/css/Editor.css'
import './static/css/Mypage.css'
import {Route, Switch,withRouter} from "react-router-dom"
import {BoardConnector} from "./board/BoardConnector"
import Footer from "./footer/Footer"
import Editor from "./upload/Editor"
import Header from "./header/Header"
import {AuthPrompt} from "./auth/AuthPrompt"
import {Provider} from "react-redux"
import {authWrapper} from "./auth/AuthWrapper";
import {HumorDataStore} from "./data/DataStore"
import UserPage from "./userpage/UserPage";

class App extends Component{
  render(){
    return<Provider store = {HumorDataStore}>
            <div className="App">
              <Header/>
            <Switch>
              <React.Fragment>
                <Route exact path="/" component={BoardConnector}/>
                <Route path="/upload" component={Editor}/>
                <Route path="/login" component={AuthPrompt}/>
                <Route path="/boards" component={BoardConnector}/>
                <Route path="/mypage" component={UserPage}/>
              </React.Fragment>
            </Switch>
            <Footer/>
          </div>
          </Provider>
  }
}
export default authWrapper(withRouter(App));