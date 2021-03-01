import React, {Component} from "react"
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter} from "react-router-dom"
import MyBoard from "./MyBoard";

class MyBoardConnector extends Component{
    constructor(props){
        super(props);

        this.state = {
            boardList : [],
            last_board,
        }
    }

    componentDidMount(){
        this.getData();
        window.addEventListener('scroll', this.infiniteScroll);
    }
        
    componentWillUnmount(){
        window.removeEventListener('scroll', this.infiniteScroll);
    }


    getData = () => {
        const {last_board,boardList} = this.state;
        var resturl = '/mypage/board'
        if(last_board!==0){
            resturl+=`?board_id=${last_board}`
        }
        this.props.request("get", resturl).then(res=>{
            const resData = res.data.list
            if(res.data.success===true){
                if(resData.length>0){
                    this.setState({
                        boardList:[...boardList,...resData],
                        last_board:resData[resData.length-1]['id']
                    })
                }else{
                    window.removeEventListener('scroll',this.infiniteScroll)
                }
            }else{
                this.props.history.push("/login");
            }
        })
    }

    infiniteScroll = () =>{
        const { documentElement, body } = document;

        const scrollHeight = Math.max(documentElement.scrollHeight, body.scrollHeight);
        const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
        const clientHeight = documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight) {
            this.getData();
        }
    }

    render(){
        const boardList = this.state.boardList
        return <table>
            <MyBoard BoardList = {boardList}/>
        </table>
    }
}

export default authWrapper(withRouter(MyBoardConnector))