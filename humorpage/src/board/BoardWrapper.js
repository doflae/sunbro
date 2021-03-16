import React, {Component} from "react";
import {BoardContext} from "./BoardContext"

export const boardWrapper = (WrappedComponent) =>
    class extends Component{
        render = () =>
        <BoardContext.Consumer>
            {context=>
                <WrappedComponent{...this.props}{...context}/>
            }
        </BoardContext.Consumer>
    }