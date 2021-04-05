import React, { Component } from "react";
import Board from "../board/Board"
import { authWrapper } from "../auth/AuthWrapper";

class UserPage extends Component{
    constructor(){
        super();

        this.state = {
            boardlist : [],
            lastId : 0,
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
        window.addEventListener('scroll',this.infiniteScroll);
    }
    componentWillUnmount(){
        window.removeEventListener('scroll',this.infiniteScroll);
    }
    gotoNext = () =>(e)=> {
        e.preventDefault();
        const {documentElement, body} = document;
        let {lastElementid} = this.state
        const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
        const scrollBottom = scrollTop+documentElement.clientHeight
        const boards = documentElement.querySelectorAll(".board")
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
    infiniteScroll=()=>{
        const { documentElement, body } = document;

        const scrollHeight = Math.max(documentElement.scrollHeight, body.scrollHeight);
        const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
        const clientHeight = documentElement.clientHeight;

        if (scrollTop + clientHeight >= scrollHeight) {
            this.getData();
        }
    }
    getData =()=>{
        const{lastId,boardlist} = this.state
        let resturl = `/board/user?usernum=${this.props.match.params.key}`
        if(lastId) resturl+=`&last_id=${lastId}`
        this.props.request("get",resturl).then(res=>{
            if(res.status===200 && res.data.success){
                const resData = res.data.list
                if(resData.length>0){
                    this.setState({
                        boardlist:[...boardlist, ...resData],
                        lastId:resData[resData.length-1]['id']
                    })
                }else{
                    window.removeEventListener('scroll', this.infiniteScroll);
                }
            }
        })
    }

    render(){
        const {boardlist} = this.state
        return <Board boards = {boardlist}/>
    }
}

export default authWrapper(UserPage);