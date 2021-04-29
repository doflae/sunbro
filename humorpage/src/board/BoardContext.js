import React from "react"

export const BoardContext = React.createContext({
    boardDetail:null,
    boardKey:null,
    setBoardKey: (key)=>{},
    setBoard:(bid)=>{},
})