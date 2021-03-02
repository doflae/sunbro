import React, {Component} from "react";
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import MyBoardConnector from  "./MyBoardConnector"
class MyLikePageMain extends Component{
    constructor(props){
        super(props);

        this.state = {
            boardList:[],
            checkedBox:new Set(),
            pagenum:0
        }
    }
    componentDidMount(){
        this.getData();
    }

    getData = () => {
        const {boardList} = this.state;
        const resturl = `/mypage/likes?num=${this.state.pagenum}&size=${this.props.pagesize}`
        this.props.request("get", resturl).then(res=>{
            const resData = res.data.list
            if(res.data.success===true){
                if(resData.length>0){
                    this.setState({
                        boardList:[...boardList,...resData],
                        pagenum:this.state.pagenum+1,
                    })
                }
            }
        })
    }

    render(){
        const boardList = this.state.boardList
        if(boardList===null||boardList.length===0){
            return null
        }
        return <MyBoardConnector boards={this.state.boardList}/>
    }
}

export default withRouter(authWrapper(MyLikePageMain))