import React from "react"

export const BoardContext = React.createContext({
    boardDetail:null,
    boardPageOption:-1,
    setBoardPageOption:(option)=>{},
    setBoard:(bid)=>{}
})