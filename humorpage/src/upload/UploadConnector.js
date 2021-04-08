import React from "react";
import { authWrapper } from "../auth/AuthWrapper";
import { boardWrapper } from "../board/BoardWrapper";
import {BlurBackGroundStlyed} from "./Styled"
import Upload from "./Upload";
import Update from "./Update";
const UploadConnector = boardWrapper(authWrapper(({...props}) =>{
    if(props.boardPageOption>-1 && props.user==null){
        props.setBoardPageOption(-1);
        props.setAuthPageOption(0);
        return null;
    }
    if(props.boardPageOption===0){
        // const bg = props.backgroundRef
        // if(bg.current) bg.current.style.filter = "brightness(0.35)";
        return <React.Fragment>
            <BlurBackGroundStlyed/>
            <Upload/>
        </React.Fragment>
    } 
    if(props.boardPageOption===1) {
        return <React.Fragment>
        <BlurBackGroundStlyed/>
        <Update/>
    </React.Fragment>
    }
    return null;
}))

export default UploadConnector;