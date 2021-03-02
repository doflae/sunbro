import React,{Component} from 'react';
import userDefaultImg from "../static/img/user_default.png";
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter} from 'react-router-dom'
import {ReactComponent as Cogwheel} from "../static/svg/cogwheel.svg"

class MyHeader extends Component{

    render(){
        const user = this.props.userDetail;
        if(user===null){
            return null;
        }
        return <div className="mypage_header">
        <img className="mypage_user_img" src={user.userImg} alt="" onError={(e)=>{e.target.onerror=null;e.target.src=userDefaultImg;}}/>
        <span className="mypage_user_detail">
            <div className="mypage_user_name">{user.name}
            </div>
            <div className="mypage_user_log">
                게시물 {user.total_board_num} 개  댓글 {user.total_comment_num} 개
            </div>    
        </span>
        <button className="mypage_update_btn" onClick={(e)=>{
            this.props.history.push("/profile")
        }}>
            <Cogwheel width="40" height="40"/>
        </button>

    </div>
    }
}
export default withRouter(authWrapper(MyHeader));