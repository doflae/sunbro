import React, { useState } from "react";
import MyBoard from "./MyBoard"
import styled from "styled-components";
import Axios from "axios";
import { useHistory } from "react-router";

function MyBoardConnector({
    boards,refreshPage,pagenum,option
}){
    const [checkedBox, setCheckedBox] = useState([]);
    let history = useHistory();

    const selectSingleHandler = (checked, id) => {
        if(checked){
            setCheckedBox([...checkedBox,id]);
        }else{
            setCheckedBox(checkedBox.filter((el)=>el!==id));
        }
    }
    const selectAllHandler = (checked) =>{
        if(checked===false){
            const allArray = [];
            boards.forEach(element => {
                allArray.push(element.id);
            });
            setCheckedBox(allArray)
        }else{
            setCheckedBox([]);
        }
    }

    const deleteChecked = ()=>(e)=>{
        if(window.confirm("삭제하시겠습니까?")){
            const formData = new FormData();
            formData.append("boardList",[...checkedBox])
            Axios.post("/board/delete",formData).then(res=>{
                if(res.status===200) return res.data
            }).then(res=>{
                if(res.success){
                    refreshPage(pagenum)
                }else{
                    history.push("login");
                }
            })
        }
    }
    const btnRender = () =>{
        if(option===0){
            return <React.Fragment>
                    <CheckAllBtn checked={checkedBox.length===boards.length}
                        selectAllHandler={selectAllHandler}/>
                    <DeleteBtn deleteChecked = {deleteChecked}/>
                    </React.Fragment>
        }else if(option===1){
            return null;
        }
    }

    if(boards==null||boards.length===0){
        return <h5 className="p-2">No boards</h5>
    }
    return<div>
        <MyBoardTableHeader>
            {btnRender()}
        </MyBoardTableHeader>
            <MyBoardTable>
            <thead>
                <tr>
                    <th>
                    </th>
                    <th align="left">글번호</th>
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
            </MyBoardTable>
        </div>
}

const DeleteBtn = ({deleteChecked}) =>{
    return <TableHeaderBtnStyled onClick={deleteChecked()}>삭제</TableHeaderBtnStyled>
}

const CheckAllBtn = ({checked, selectAllHandler}) =>{
    return <TableHeaderBtnStyled onClick={(e)=> selectAllHandler(checked)}>전체 선택</TableHeaderBtnStyled>
}
const TableHeaderBtnStyled = styled.button`
    background-color:#fff;
    border:1px solid rgb(0 0 0 / 24%);
    margin:3px;
    border-radius:3px;
    &:focus{
        border:1px solid rgb(0 0 0 / 24%);
    }
`

const MyBoardTableHeader = styled.div`
    background-color:rgb(0 0 0 / 5%); 
`

const MyBoardTable = styled.table`
    border-collapse:separate;
    border-spacing: 0px 10px;
    width:100%;
    & thead tr th{
        padding-bottom:5px;
        border-bottom: 1px solid rgb(0 0 0 / 24%); 
        border-collapse: separate;
    }
    & tbody tr td{
        padding-bottom:5px;
        border-bottom: 1px solid rgb(0 0 0 / 24%); 
        border-collapse: separate;
    }
`

export default MyBoardConnector;