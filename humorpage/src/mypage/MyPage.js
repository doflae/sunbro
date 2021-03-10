import React,{Component} from "react";
import {withRouter} from 'react-router-dom'
import {authWrapper} from "../auth/AuthWrapper"
import MyHeader from "./MyHeader"
import MyPageMain from "./MyPageMain"
import MyLikePageMain from "./MyLikePageMain"

class MyPage extends Component{
    constructor(props){
        super(props)
        this.state = {
            userDetail:null,
            option:0,
            pagesize:10,
            loading:true
        }
    }
    componentDidMount(){
        this.props.request("get","/user/log").then(res=>{
            if(res.data.success===true){
                this.setState({
                    userDetail:res.data.data,
                    loading:false
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
        if(this.state.loading) return <span>Loading...</span>
        return <span className="mypage">
                <MyHeader gotoupdate={this.gotoupdate}
                 userDetail = {this.state.userDetail}/>
            <div className="mypage_option">
                <button className="mypage_option_btn" onClick={(e)=>{e.preventDefault();this.setState({option:0})}}>내가 쓴 글</button>
                <button className="mypage_option_btn" onClick={(e)=>{e.preventDefault();this.setState({option:1})}}>좋아요 누른 글</button>
            </div>
            {this.state.option===0?<MyPageMain pagesize={this.state.pagesize} total_num={this.state.userDetail.total_board_num}/>:null}
            {this.state.option===1?<MyLikePageMain pagesize={this.state.pagesize} total_num={this.state.userDetail.total_board_likes}/>:null}
        </span>
    }
}

export default withRouter(authWrapper(MyPage));