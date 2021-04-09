import React, {Component} from "react"
import {BoardContext} from "./BoardContext";

export class BoardProviderImpl extends Component{
    constructor(props){
        super(props)
        this.state={
            boardDetail:null,
            boardKey:null,
        }
    }
    setBoardKey = (key) =>{
        const setKey = () =>{
            this.setState({boardKey:key});
        }
        return new Promise(function(resolve){
            resolve(setKey());
        })
    }
    setBoard = (board) =>{
        this.setState({
            boardDetail:board,
        })
    }
    render = () =>
        <BoardContext.Provider value={{...this.state,
        setBoard:this.setBoard,
        setBoardKey:this.setBoardKey}}>
            {this.props.children}
        </BoardContext.Provider>
}