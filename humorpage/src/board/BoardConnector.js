import React, {Component} from "react";
import {authWrapper} from "../auth/AuthWrapper"
import Board from "./Board";
class BoardConnector extends Component{
    constructor(props){
        super(props)

        this.state = {
            boardList : [],
            last_board:0,
        };
        this.boardElements = [];
        this.registerRef = this.registerRef.bind(this)
    }

    registerRef = (elem) =>{
        if(elem!==null){
            this.boardElements.push(elem)
        }
    }

    componentDidMount(){
        this.getData();
        var foot = document.querySelector(".footer")
        var godownbtn = document.createElement("p")
        godownbtn.className = "goNext"
        godownbtn.innerText = "다음글"
        godownbtn.addEventListener('click',this.gotoNext())
        foot.appendChild(godownbtn)
        this.setState({
            lastElementid:0,
            erazeTarget:godownbtn,
        })
        window.addEventListener('scroll', this.infiniteScroll);
    }
    
    componentWillUnmount(){
        window.removeEventListener('scroll', this.infiniteScroll);
        document.querySelector(".footer").removeChild(this.state.erazeTarget)
    }

    gotoNext = () =>(e)=> {
        e.preventDefault();
        const {documentElement, body} = document;
        const {lastElementid} = this.state;
        const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
        const scrollBottom = scrollTop+documentElement.clientHeight
        const boards = this.boardElements
        for(let i = lastElementid+1; i<boards.length;i++){
            const b = boards[i]
            const offsetTop = b.offsetTop
            if(offsetTop+b.offsetHeight<scrollBottom) continue
            this.setState({
                lastElementid:i,
            })
            window.scrollTo({top:offsetTop, behavior:'smooth'})
            break;
            
        }
    }

    getData = () => {
        const {last_board,boardList} = this.state;
        var resturl = '/board/recently?'
        if(last_board!==0){
            resturl+=`board_id=${last_board}`
        }
        this.props.request('get',resturl).then(res=>{
            const resData = res.data.list
            if(0<resData.length && resData.length<11){
                this.setState({
                    boardList:[...boardList, ...resData],
                    last_board:resData[resData.length-1]['id']
                })
            }else{
                window.removeEventListener('scroll', this.infiniteScroll);
            }
        })
    }

    infiniteScroll = () => {
        const { documentElement, body } = document;

        const scrollHeight = Math.max(documentElement.scrollHeight, body.scrollHeight);
        const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
        const clientHeight = documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight) {
            this.getData();
        }
    }
    render(){
        const boardList = this.state.boardList;
        if(boardList.length===0) return null;
        return boardList.map(board => <Board setRef={this.registerRef} board={board} key={board.id}/>)
    }
}

export default authWrapper(BoardConnector);