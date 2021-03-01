import React,{Component} from 'react';
import userDefaultImg from "../static/img/user_default.png";
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter} from 'react-router-dom'

class MyHeader extends Component{
    constructor(props){
        super(props)
        this.state={
            user:null,
        }
    }
    componentDidMount(){
        this.props.request("get","/mypage/log").then(res=>{
            if(res.data.success===true){
                this.setState({
                    user:res.data.data
                })
            }else{
                console.log(this.props.history)
                this.props.history.push("/login")
            }
        })
    }
    render(){
        const user = this.state.user;
        if(user===null){
            return null;
        }
        return <div className="mypage_header">
        <img className="mypage_user_img" src={user.userImg} alt="" onError={(e)=>{e.target.onerror=null;e.target.src=userDefaultImg;}}/>
        <span className="mypage_user_detail">
            <div className="mypage_user_name">{user.name}</div>
            <div className="mypage_user_log">
                게시물 {user.total_board_num} 개  댓글 {user.total_comment_num} 개
            </div>    
        </span>

    </div>
    }
}
export default withRouter(authWrapper(MyHeader));