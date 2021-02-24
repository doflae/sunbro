import React,{Component} from "react";
import {withRouter} from 'react-router-dom'
import {authWrapper} from "../auth/AuthWrapper"

class UserPage extends Component{
    //내가 쓴 글
    //내가 쓴 댓글
    //프로필 수정
    render(){
        return <span className="mypage">
            <div className="mypage_header">이미지 내정보 #프로필 수정</div>
            <div className="mypage_option">
                #내가 쓴 글     #내가 쓴 댓글 
            </div>
        </span>
    }
}

export default withRouter(authWrapper(UserPage));