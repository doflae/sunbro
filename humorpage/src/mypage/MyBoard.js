import React from "react"
import {sanitizeNonNull, getDate, convertUnitOfNum} from "../utils/Utils"

function MyBoard({
    board,
    checkedBox,
    selectSingleHandler
}){
    const id = board.id
    const comments_num = board.comments_num
    return<><tr>
        <td align="center">
            <input type="checkbox" checked={checkedBox.includes(id)?true:false} onChange={(e) => selectSingleHandler(e.target.checked, id)}/>
        </td>
        <td align="center">{id}</td>
        <td align="left">{board.title} <span>{comments_num}</span></td>
        <td align="center">{getDate(board.created)}</td>
        <td align="center">{convertUnitOfNum(board.likes)}</td>
    </tr>
    <tr>
        <td></td>
        <td colSpan="4">
            <div dangerouslySetInnerHTML={{__html:sanitizeNonNull(board.thumbnail)}}></div>
        </td>
    </tr>
    </>
    
}
export default React.memo(MyBoard);