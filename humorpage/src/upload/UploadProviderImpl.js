import React, { useState,useRef } from "react";
import {UploadContext} from "./UploadContext"

export const UploadProviderImpl = ({...props}) =>{
    // option 0 : uploadPage
    //        1 : updatePage
    const [uploadPageOption, setUploadPageOption] = useState(-1);
    const [uploadPageRef, setUploadPageRef] = useState(useRef());
    const [updatePageRef, setUpdatePageRef] = useState(useRef());

    const onOffUploadPage = (pageOption) =>{
        if(updatePageRef.current) updatePageRef.current.style.display="";
        if(uploadPageRef.current) uploadPageRef.current.style.display="";
        setUploadPageOption(pageOption)
    }
    return <UploadContext.Provider value = {{
        uploadPageOption,
        uploadPageRef,
        updatePageRef,
        onOffUploadPage:onOffUploadPage}}>
            {props.children}
        </UploadContext.Provider>
}