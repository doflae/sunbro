import React, {Component} from "react"
import {BoardContext} from "./BoardContext";

export class BoardProviderImpl extends Component{
    constructor(props){
        super(props)
        this.state={
            boardDetail:null,
            boardPageOption:-1
        }
    }
    setBoardPageOption = (option) =>{
        this.setState({
            boardPageOption:option,
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
        setBoardPageOption:this.setBoardPageOption}}>
            {this.props.children}
        </BoardContext.Provider>
}