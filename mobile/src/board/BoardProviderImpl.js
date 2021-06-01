import React, {Component} from "react"
import {BoardContext} from "./BoardContext";

export class BoardProviderImpl extends Component{
    constructor(props){
        super(props)
        this.state={
            boardKey:null,
            boardUrl:"/board/recently?"
        }
    }

    setBoardUrl = (url) =>{
        this.setState({
            boardUrl:url
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
    render = () =>
        <BoardContext.Provider value={{...this.state,
            setBoardUrl:this.setBoardUrl,
            setBoardKey:this.setBoardKey}}>
            {this.props.children}
        </BoardContext.Provider>
}