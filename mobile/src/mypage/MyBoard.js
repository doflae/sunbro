import React from "react"
import {sanitizeNonNull, getDate, convertUnitOfNum} from "../utils/Utils"
import styled from "styled-components"
import { useHistory } from "react-router"
function MyBoard({
    board,
    checkedBox,
    selectSingleHandler
}){
    const id = board.id
    const comments_num = board.comments_num
    let history = useHistory();
    const goToBoard = () =>(e) =>{
        history.push(`/board/${id}`);
    }   

    return <React.Fragment>
        <tr>
        <td align="center">
            <CheckBox id={id} checkedBox={checkedBox} 
            selectSingleHandler={selectSingleHandler}/>
        </td>
        <td>{id}</td>
        <TitleStyled align="left" onClick={goToBoard()}>
            {board.title} 
            [<CommentNumStyled>{convertUnitOfNum(comments_num)}</CommentNumStyled>]
            <div dangerouslySetInnerHTML={{__html:sanitizeNonNull(board.thumbnail)}}></div>
        </TitleStyled>
        
        <td align="center">{getDate(board.created)}</td>
        <td align="center">{convertUnitOfNum(board.likes)}</td>
    </tr>
    </React.Fragment>
}

const CheckBox = ({id,checkedBox,selectSingleHandler})=>{
    return <input type="checkbox" checked={checkedBox.includes(id)?true:false} onChange={(e) => selectSingleHandler(e.target.checked, id)}/>
}

const TitleStyled = styled.td`
    cursor:pointer;
    &:hover{
        text-decoration:underline;
    }
`

const CommentNumStyled = styled.span`
    font-size:12px;
    margin:0px 1px 0px 1px;
`

export default MyBoard;