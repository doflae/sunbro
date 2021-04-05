import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router} from "react-router-dom";
import App from './App';
import * as serviceWorker from "./serviceWorker";
import {AuthProviderImpl} from "./auth/AuthProviderImpl"
import {BoardProviderImpl} from "./board/BoardProviderImpl"
import axios from "axios";

axios.defaults.baseURL = 'http://localhost:8080/api'

ReactDOM.render(
<BoardProviderImpl>    
  <AuthProviderImpl>
    <Router>
      <App/>
    </Router>
  </AuthProviderImpl>
</BoardProviderImpl>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
serviceWorker.unregister();