import React from "react"

export const BoardContext = React.createContext({
    boardDetail:null,
    boardKey:null,
    boardMediaDir:{},
    setBoardKey: (key)=>{},
    setBoard:(bid)=>{},
    setBoardDir:(boardDirs)=>{},
})