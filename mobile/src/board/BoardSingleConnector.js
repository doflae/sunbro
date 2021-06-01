import React, { useEffect, useState } from "react"
import { useParams } from "react-router";
import Board from "./Board";
import Axios from "axios";
function BoardSingleConnector(){
    let match = useParams();
    const [board,setBoard] = useState(null);
    useEffect(()=>{
        Axios.get(`/board/get/${match.key}`).then(res=>{
            if(res.status===200 && res.data.success){
                setBoard(res.data.data)
            }
        })
    },[match.key])
    if(board==null) return null;
    return <Board board={board}/>
}

export default BoardSingleConnector;