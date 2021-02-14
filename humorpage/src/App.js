import React, { Component } from 'react';
import './static/css/Normalize.css'
import './static/css/App.css';
import './static/css/Content.css'
import './static/css/Comment.css'
import "react-quill/dist/quill.snow.css"
import './static/css/Editor.css'
import {Route, Switch,withRouter} from "react-router-dom"
import {ContextConnector} from "./context/ContextConnector"
import Footer from "./footer/Footer"
import Editor from "./upload/Editor"
import {Header} from "./header/Header"
import {AuthPrompt} from "./auth/AuthPrompt"
import {AuthProviderImpl} from "./auth/AuthProviderImpl"
import {Provider} from "react-redux"
import {HumorDataStore} from "./data/DataStore"
class App extends Component{
  render(){
    return<AuthProviderImpl> 
          <Provider store = {HumorDataStore}>
            <div className="App">
              <Header/>
            <Switch>
              <React.Fragment>
                <Route exact path="/" component={ContextConnector}/>
                <Route path="/upload" component={Editor}/>
                <Route path="/login" component={AuthPrompt}/>
                <Route path="/contexts" component={ContextConnector}/>
              </React.Fragment>
            </Switch>
            <Footer/>
          </div>
          </Provider>
          </AuthProviderImpl>
  }
}
export default withRouter(App);