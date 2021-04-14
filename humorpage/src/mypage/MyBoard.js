import React from "react"
import {convertUnitOfNum} from "../utils/Utils"
import styled from "styled-components"
import { useHistory } from "react-router"


function MyBoard({
    board,
    checkedBox,
    selectSingleHandler,
    checkBoxOn,
}){
    const id = board.id
    let history = useHistory();
    const goToBoard = () =>(e) =>{
        history.push(`/board/${id}`);
    }   

    return <React.Fragment>
        <tr>
        {checkBoxOn?
        <td align="center">
            <CheckBox id={id} checkedBox={checkedBox} 
            selectSingleHandler={selectSingleHandler}/>
        </td>
        :null}
        <TitleZoneStyled align="left" onClick={goToBoard()}>
            <TitleStyled>{board.title}</TitleStyled> 
            <CommentNumStyled>{convertUnitOfNum(board.total_comments_num)}</CommentNumStyled>
        </TitleZoneStyled>
        <td align="center">{convertUnitOfNum(board.total_likes_num)}</td>
    </tr>
    </React.Fragment>
}

const CheckBox = ({id,checkedBox,selectSingleHandler})=>{
    return <input type="checkbox" checked={checkedBox.includes(id)?true:false} onChange={(e) => selectSingleHandler(e.target.checked, id)}/>
}

const TitleStyled = styled.div`
    text-overflow: ellipsis;
    overflow: hidden; 
    max-width: 190px;
    white-space: nowrap;
`

const TitleZoneStyled = styled.td`
    cursor:pointer;
    display:flex;
    padding-left:5px;
    &:hover{
        text-decoration:underline;
    }
`

const CommentNumStyled = styled.span`
    color:#ec4646;
    margin:0px 1px;
`

export default MyBoard;