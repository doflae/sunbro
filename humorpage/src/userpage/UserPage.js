import React,{Component} from "react";
import {withRouter} from 'react-router-dom'
import {authWrapper} from "../auth/AuthWrapper"
import MyHeader from "./MyHeader"
import MyPageMain from "./MyPageMain"
import UpdateProfile from "./UpdateProfile"
import MyLikePageMain from "./MyLikePageMain"
class UserPage extends Component{
    constructor(props){
        super(props)
        this.state = {
            userDetail:null,
            option:0,
            pagesize:10
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
                <MyHeader pageOption={this.state.option}
                 userDetail = {this.state.userDetail}/>
            <div className="mypage_option">
                <button className="mypage_option_btn" onClick={(e)=>{e.preventDefault();this.setState({option:0})}}>내가 쓴 글</button>
                <button className="mypage_option_btn" onClick={(e)=>{e.preventDefault();this.setState({option:1})}}>좋아요 누른 글</button>
            </div>
            {this.state.option===0?(<MyPageMain pagesize={this.state.pagesize}/>):
            this.state.option===1?(<MyLikePageMain pagesize={this.state.pagesize}/>):
            <UpdateProfile userDetail={this.state.userDetail}/>}
        </span>
    }
}

export default withRouter(authWrapper(UserPage));