import React, {Component} from "react"
import Axios from "axios"
import {AuthContext} from "./AuthContext"

export class AuthProviderImpl extends Component{
    constructor(props){
        super(props);
        this.state={
            user:null,
        }
    }

    request = (method, url, data=null) =>{
        return Axios({method,url,data,}).then(res=>{
            if("user" in res.headers){
                this.setState({
                    user:JSON.parse(res.headers['user'])
                })
            }
            return res
        })
    }

    authenticate = (credentials) =>{
        let credential_form = new FormData();
        credential_form.append('uid',credentials['uid'])
        credential_form.append('password',credentials['password'])
        return Axios.post("/account/login",credential_form).then(response =>{
            if ("user" in response.headers){
                this.setState({
                    user:JSON.parse(response.headers['user']),
                })
            }else {
                throw new Error("Invalid Credential");
            }
            return response
        })
    }

    signout = () =>{
        this.setState({
            user:null,
        })
    }

    render = () =>
        <AuthContext.Provider value={{...this.state,
        authenticate:this.authenticate, signout:this.signout, request:this.request}}>
            {this.props.children}
        </AuthContext.Provider>
}