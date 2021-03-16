import React, {Component} from "react"
import Axios from "axios"
import {BoardContext} from "./BoardContext";

export class BoardProviderImpl extends Component{
    constructor(props){
        super(props)
        this.state={
            boardDetail:null,
        }
    }
    getBoard = (bid) =>{
        return Axios.get(`/board/${bid}`).then(res=>{
            if(res.status===200 && res.data.success){
                this.setState({
                    boardDetail:res.data.data,
                },()=>{
                    return res;
                });
            }
        })
    }
    render = () =>
        <BoardContext.Provider value={{...this.state,
        getBoard:this.getBoard}}>
            {this.props.children}
        </BoardContext.Provider>
}