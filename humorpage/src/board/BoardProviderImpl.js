import React, {Component} from "react"
import {BoardContext} from "./BoardContext";

export class BoardProviderImpl extends Component{
    constructor(props){
        super(props)
        this.state={
            boardDetail:null,
            boardKey:null,
            boardMediaDir:{}
        }
    }

    setBoardDir = (boardDirs) =>{
        const {boardMediaDir} = this.state
        this.setState({
            boardMediaDir:{...boardMediaDir,...boardDirs}
        })
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
            setBoardDir:this.setBoardDir,
            setBoardKey:this.setBoardKey}}>
            {this.props.children}
        </BoardContext.Provider>
}