import React, {Component} from "react"
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter} from "react-router-dom"

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
        return <table>

        </table>
    }
}

export default authWrapper(withRouter(MyBoardConnector))