import React, { useEffect, useState } from "react";
import MyBoard from "./MyBoard"
import styled from "styled-components";
import Axios from "axios";
import { useHistory } from "react-router";

function MyBoardConnector({
    boards,refreshPage,pagenum,option,...props
}){
    const [checkedBox, setCheckedBox] = useState([]);
    const [boardList, setBoardList] = useState();
    useEffect(()=>{
        setBoardList(boards)
    },[boards])
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
            boardList.forEach(element => {
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
                    <CheckAllBtn checked={checkedBox.length===boardList.length}
                        selectAllHandler={selectAllHandler}/>
                    <DeleteBtn deleteChecked = {deleteChecked}/>
                    </React.Fragment>
        }else if(option===1){
            return null;
        }
    }

    if(boardList==null||boardList.length===0){
        return null;
    }
    return <React.Fragment>
        <MyBoardTableHeader>
            {btnRender()}
        </MyBoardTableHeader>
            <MyBoardTable>
            <thead>
                <tr>
                    {option===0?<th></th>:null}
                    <th>제목</th>
                    <th>좋아요</th>
                </tr>
            </thead>
            <tbody>
                {boardList.map(board=>{
                    return <MyBoard board={board} key={board.id} checkBoxOn={option===0}
                    checkedBox={checkedBox} setCheckedBox={setCheckedBox}
                    selectSingleHandler={selectSingleHandler}/>
                })}
            </tbody>
            </MyBoardTable>
        <div className="mypage_pagnation">
            <span className="left_triangle"></span>
            <span className="left_subtext" onClick={props.goPrev()}>이전</span>
            {props.num_list}
            <span className="right_subtext" onClick={props.goNext()}>다음</span>
            <span className="right_triangle"></span>
        </div>
        </React.Fragment>
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