import React,{useRef} from "react";
import { authWrapper } from "../auth/AuthWrapper";
import { uploadWrapper } from "./UploadWrapper";
import Upload from "./Upload";
import Update from "./Update";
const UploadConnector = uploadWrapper(authWrapper(({...props}) =>{
    const option = props.uploadPageOption
    if(option>-1 && props.user==null){
        props.onOffUploadPage(-1);
        props.setAuthPageOption(0);
        return null;
    }
    if(option<0) return null;
    if(option%2===0){
        return <div ref={props.uploadPageRef}>
                <Upload/>
            </div>
    } 
    return <div ref={props.updatePageRef}>
        <Update/>
        </div>
}))

export default UploadConnector;