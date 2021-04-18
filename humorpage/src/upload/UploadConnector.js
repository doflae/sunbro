import React,{useRef} from "react";
import { authWrapper } from "../auth/AuthWrapper";
import { uploadWrapper } from "./UploadWrapper";
import {BlurBackGroundStyled} from "./Styled"
import Upload from "./Upload";
import Update from "./Update";
const UploadConnector = uploadWrapper(authWrapper(({...props}) =>{
    let bgRef = useRef();
    const option = props.uploadPageOption
    if(option>-1 && props.user==null){
        props.onOffUploadPage(-1);
        props.setAuthPageOption(0);
        return null;
    }
    if(option<0) return null;
    if(option%2===0){
        // const bg = props.backgroundRef
        // if(bg.current) bg.current.style.filter = "brightness(0.35)";
        return <div ref={props.uploadPageRef}>
                <BlurBackGroundStyled ref={bgRef}/>
                <Upload bgRef={bgRef}/>
            </div>
    } 
    return <div ref={props.updatePageRef}>
        <BlurBackGroundStyled ref={bgRef}/>
        <Update bgRef = {bgRef}/>
        </div>
}))

export default UploadConnector;