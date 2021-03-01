import React,{Component} from "react";
import {withRouter} from 'react-router-dom'
import {authWrapper} from "../auth/AuthWrapper"
import MyHeader from "./MyHeader"

class UserPage extends Component{
    constructor(props){
        super(props)
        this.state = {
            userDetail:null,
        }
    }
    //내가 쓴 글
    //내가 쓴 댓글
    //프로필 수정
    render(){
        return <span className="mypage">
                <MyHeader/>
            <div className="mypage_option">
                #내가 쓴 글     #내가 쓴 댓글
            </div>
        </span>
    }
}

export default withRouter(authWrapper(UserPage));