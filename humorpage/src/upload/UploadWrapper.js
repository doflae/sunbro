import React, {Component} from "react";
import {UploadContext} from "./UploadContext"

export const uploadWrapper = (WrappedComponent) =>
    class extends Component{
        render = () =>
        <UploadContext.Consumer>
            {context=>
                <WrappedComponent{...this.props}{...context}/>
            }
        </UploadContext.Consumer>
    }