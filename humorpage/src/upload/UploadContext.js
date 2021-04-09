import React from "react"

export const UploadContext = React.createContext({
    uploadPageOption:-1,
    uploadPageRef:null,
    updatePageRef:null,
    setUploadPageRef:(ref) =>{},
    setUpdatePageRef:(ref) =>{},
    onOffUploadPage:(pageOption) =>{},
})