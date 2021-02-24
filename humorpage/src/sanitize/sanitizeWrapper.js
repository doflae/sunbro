import React, {Component} from "react"
import {SanitizeContext} from "./sanitizeContext"

export const sanitizeWrapper = (WrappedComponent) =>
    class extends Component{
        render = () =>
        <SanitizeContext.Consumer>
            {context =>
                <WrappedComponent{...this.props} {...context}/>
            }
        </SanitizeContext.Consumer>
    }