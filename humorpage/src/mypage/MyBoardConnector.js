import React, { useState } from "react";
import MyBoard from "./MyBoard"

function MyBoardConnector({
    boards
}){
    const [checkedBox, setCheckedBox] = useState([]);

    const selectSingleHandler = (checked, id) => {
        if(checked){
            setCheckedBox([...checkedBox,id]);
        }else{
            setCheckedBox(checkedBox.filter((el)=>el!==id));
        }
    }
    const selectAllHandler = (checked) =>{
        if(checked){
            const allArray = [];
            boards.forEach(element => {
                allArray.push(element.id);
            });
            setCheckedBox(allArray)
        }else{
            setCheckedBox([]);
        }
    }
    if(boards==null||boards.length===0){
        return <h5 className="p-2">No boards</h5>
    }
    return<div>
            <input type="checkbox" 
                checked={checkedBox.length === boards.length?true:false} 
                onChange={(e)=> selectAllHandler(e.target.checked)}></input>
            <table className="MyBoard_table">
            <thead>
                <tr>
                    <th></th>
                    <th>글번호</th>
                    <th>제목</th>
                    <th>작성일</th>
                    <th>좋아요</th>
                </tr>
            </thead>
            <tbody>
            {boards.map(board=>{
            return <MyBoard board={board} key={board.id}
            checkedBox={checkedBox} setCheckedBox={setCheckedBox}
            selectSingleHandler={selectSingleHandler}/>
        })}
        </tbody>
        </table>
        </div>
}
export default React.memo(MyBoardConnector);