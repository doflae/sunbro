import React, { Component } from "react";
import styled from "styled-components"

const EmailAuthSuccess = styled.div`
    color : #54e346;
`
const EmailAuthFailed = styled.div`
    color : #f05454;
`

export class ValidationEmail extends Component{
    render(){
        if(this.props.checkClear!==null && this.props.checkClear===false){
            return <div>
                <input type="text" placeholder="이메일 인증 코드를 입력해주세요."></input>
                <button onClick={e=>{e.preventDefault(); this.props.onClick(e.target.previousElementSibling.value)}}>코드 인증</button>
                <EmailAuthFailed>이메일 인증에 실패하였습니다. 코드를 다시 확인해주세요.</EmailAuthFailed>
            </div>
        }
        else if(this.props.onClick){
            return <div>
                <input type="text" placeholder="이메일 인증 코드를 입력해주세요."></input>
                <button onClick={e=>{e.preventDefault(); this.props.onClick(e.target.previousElementSibling.value)}}>코드 인증</button>
            </div>
        }else if(this.props.checkClear){
            return <EmailAuthSuccess>
                이메일 인증에 성공하였습니다.
            </EmailAuthSuccess>
        }
        return null;
    }
}

