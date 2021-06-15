import React from "react"

export const AuthContext = React.createContext({
    user:null,
    authPageOption:-1,
    authenticate:(uid, password)=>{},
    logout:()=>{},
    setAuthPageOption:(option)=>{},
    request:(method,url,data)=>{}
})