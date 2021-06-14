import React,{Component} from "react";
import {withRouter} from 'react-router-dom'
import {authWrapper} from "../auth/AuthWrapper"
import MyHeader from "./MyHeader"
import MyPageMain from "./MyPageMain"
import styled from "styled-components"

class MyPage extends Component{
    constructor(props){
        super(props)
        this.state = {
            userDetail:null,
            option:1,
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
            <MyPageOptionZone>
                <PageOptionBtnStyled 
                boxOn={this.state.option===1}
                onClick={()=>{this.setState({option:1})}}>
                    Like</PageOptionBtnStyled>
                <CenterBar/>
                <PageOptionBtnStyled 
                boxOn={this.state.option===0}
                onClick={()=>{this.setState({option:0})}}>
                    My</PageOptionBtnStyled>
            </MyPageOptionZone>
                <MyPageMain pagesize={this.state.pagesize} 
                total_board_num={this.state.userDetail.total_board_num}
                total_like_num={this.state.userDetail.total_like_num}
                option={this.state.option}/>
            </span>
    }
}

const MyPageOptionZone = styled.div`
    width:100%;
    display:flex;
    
`

const PageOptionBtnStyled = styled.div`
    width:50%;
    text-align: center;
    padding: 5px;
    font-size: 1.5em;
    border-top:${props=>props.boxOn?"2px solid":""};
    border-bottom:${props=>props.boxOn?"":"2px solid"};
    opacity: 0.3;
    font-weight: 800;
    cursor: pointer;
    &:hover{
        opacity:1.0;
    }
`

const CenterBar = styled.div`
    width:2px;
    background-color: #000;
    opacity:0.3;
    ${MyPageOptionZone}:hover & {
        opacity:1.0;
    }
`

export default withRouter(authWrapper(MyPage));