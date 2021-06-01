import React from "react"

export const BoardContext = React.createContext({
    boardKey:null,
    boardUrl:null,
    setBoardUrl:(url)=>{},
    setBoardKey: (key)=>{},
})