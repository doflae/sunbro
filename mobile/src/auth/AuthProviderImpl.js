import React, {Component} from "react"
import Axios from "axios"
import {AuthContext} from "./AuthContext"
export class AuthProviderImpl extends Component{
    constructor(props){
        super(props);
        this.state={
            user:null,
            authPageOption:-1,
        }
    }

    //pageOption 0~3 : Auth
    setAuthPageOption = (option) =>{
        this.setState({
            authPageOption:option,
        })
    }

    request = (method, url, data=null, params=null) =>{
        const{user} = this.state
        return Axios({method,url,data,params})
        .then((res)=>{
            if("user" in res.headers){
                if(user===null){
                    this.setState({
                        user:JSON.parse(res.headers['user']),
                    })
                }
            }else{
                this.setState({
                    user:null,
                })
            }
            return res;
        })
    }

    authenticate = (credentials) =>{
        let credential_form = new FormData();
        credential_form.append('uid',credentials['id'])
        credential_form.append('password',credentials['password'])
        return Axios.post("/account/login",credential_form).then(response =>{
            if ("user" in response.headers){
                this.setState({
                    user:JSON.parse(response.headers['user']),
                })
            }else {
                throw new Error("잘못된 아이디 또는 비밀번호입니다.");
            }
            return response
        })
    }

    signout = () =>{
        return Axios.get('/account/logout').then(res=>{
            if(res.data.success){
                this.setState({
                    user:null,
                })
            }
            return res
        })
    }

    render = () =>
        <AuthContext.Provider value={{...this.state,
        authenticate:this.authenticate, signout:this.signout, request:this.request,
        setAuthPageOption:this.setAuthPageOption}}>
            {this.props.children}
        </AuthContext.Provider>
}