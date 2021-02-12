import React, { Component } from 'react';
import './static/css/Normalize.css'
import './static/css/App.css';
import './static/css/Content.css'
import './static/css/Comment.css'
import "react-quill/dist/quill.snow.css"
import './static/css/Editor.css'
import {HumorDataStore} from "./data/DataStore"
import {Provider} from "react-redux"
import {BrowserRouter as Router, Route, Switch} from "react-router-dom"
import {ContextConnector} from "./context/ContextConnector"
import {AuthProviderImpl} from "./auth/AuthProviderImpl"
import Header from "./header/Header"
import Footer from "./footer/Footer"
import Editor from "./upload/Editor"
import {AuthPrompt} from "./auth/AuthPrompt"
export default class App extends Component{

  render(){
    return <AuthProviderImpl>
        <Provider store = {HumorDataStore}>
          <Router>
            <div className="App">
            <Header/>
            <Switch>
              <div className="main">
                <Route exact path="/contexts" component={ContextConnector}/>
                <Route exact path="/upload" component={Editor}/>
                <Route exact path="/login" component={AuthPrompt}/>
              </div>
            </Switch>
            <Footer/>
          </div>
          </Router>
        </Provider>
    </AuthProviderImpl>
  }
}
