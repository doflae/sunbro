import React from "react"

export const AuthContext = React.createContext({
    user:null,
    pageOption:0,
    authenticate:(uid, password)=>{},
    signout:()=>{},
    setPageOption:(option)=>{},
    request:(method,url,data)=>{}
})