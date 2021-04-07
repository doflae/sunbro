import React from "react"

export const AuthContext = React.createContext({
    user:null,
    pageOption:-1,
    authenticate:(uid, password)=>{},
    signout:()=>{},
    setPageOption:(option)=>{},
    request:(method,url,data)=>{}
})