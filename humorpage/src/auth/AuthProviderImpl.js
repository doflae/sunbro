import React, {Component} from "react"
import Axios from "axios"
import {AuthContext} from "./AuthContext"
import {authUrl} from "../data/Urls"

export class AuthProviderImpl extends Component{
    constructor(props){
        super(props);
        this.state={
            isAuthenticated:false,
            webToken:null
        }
    }

    authenticate = (credentials) =>{
        let credential_form = new FormData();
        credential_form.append('uid',credentials['uid'])
        credential_form.append('password',credentials['password'])
        return Axios.post(authUrl,credential_form).then(response =>{
            if (response.data.success === true){
                this.setState({
                    isAuthenticated:true,
                    webToken:response.data.data
                })
                return true;
            } else {
                throw new Error("Invalid Credential");
            }
        })
    }

    signout = () =>{
        this.setState({
            isAuthenticated:false,
            webToken:null
        })
    }

    render = () =>
        <AuthContext.Provider value={{...this.state,
        authenticate:this.authenticate, signout:this.signout}}>
            {this.props.children}
        </AuthContext.Provider>
}