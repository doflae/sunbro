import React,{Component} from "react";
import {withRouter} from 'react-router-dom'
import {authWrapper} from "../auth/AuthWrapper"
import MyHeader from "./MyHeader"
import MypageMain from "./MyPageMain"


class UserPage extends Component{
    constructor(props){
        super(props)
        this.state = {
            userDetail:null,
        }
    }
    componentDidMount(){
        this.props.request("get","/mypage/log").then(res=>{
            if(res.data.success===true){
                this.setState({
                    userDetail:res.data.data
                })
            }else{
                this.props.history.push("/login")
            }
        })
    }
    //내가 쓴 글
    //내가 쓴 댓글
    //프로필 수정
    render(){
        return <span className="mypage">
                <MyHeader userDetail = {this.state.userDetail}/>
            <div className="mypage_option">
                #내가 쓴 글     #내가 쓴 댓글
            </div>
            <MypageMain/>
        </span>
    }
}

export default withRouter(authWrapper(UserPage));