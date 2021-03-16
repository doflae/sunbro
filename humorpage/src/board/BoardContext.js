import React from "react"

export const BoardContext = React.createContext({
    boardDetail:null,
    setBoard:(bid)=>{}
})