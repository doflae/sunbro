import React from "react"

export const AuthContext = React.createContext({
    user:null,
    authenticate:(uid, password)=>{},
    signout:()=>{},
    request:(method,url,data)=>{}
})