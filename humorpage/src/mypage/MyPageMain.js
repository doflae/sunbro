import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import MyBoardConnector from  "./MyBoardConnector"
import styled from "styled-components";

const MyPageMain = ({...props}) =>{
    const [boardList, setBoardList] = useState({0:[],1:[]});
    const [pageNumSet, setPageNumSet] = useState({0:1,1:1});
    const [loading, setLoading] = useState(true);
    const pagesize = props.pagesize
    const option = props.option
    const lastPageSet = {
        0:Math.ceil(props.total_board_num/pagesize),
        1:Math.ceil(props.total_like_num/pagesize)
    }
    const getData = (pagenum) =>{
        pageNumSet[option] = pagenum;
        if(boardList[option][pagenum]!=null){
            setPageNumSet(pageNumSet)
        }else if(pagenum>0){
            setLoading(true)
            let resturl;
            if(option===0){
                resturl = `/user/board?num=${pagenum-1}&size=${pagesize}`
            }
            else if(option===1){
                resturl = `/user/likes?num=${pagenum-1}&size=${pagesize}`
            }
            props.request("get", resturl).then(res=>{
                if(res.data.success===true){
                    const resData = res.data.list
                    if(resData.length>0){
                        boardList[option][pagenum]=[...resData]
                        setBoardList(boardList)
                        setPageNumSet(pageNumSet)
                    }
                }
            }).then(()=>setLoading(false));
        }
    }
    
    useEffect(()=>{
        getData(1)
    },[props.option])

    const pagnation = (pagenum) => (e) =>{
        getData(pagenum)
    }

    const refreshPage = (pagenum) => {
        pageNumSet[option] = pagenum;
        setLoading(true)
        const resturl = `/user/board?num=${pagenum-1}&size=${pagesize}`
        props.request("get", resturl).then(res=>{
            if(res.data.success===true){
                const resData = res.data.list
                boardList[option][pagenum]=[...resData]
                setBoardList(boardList)
                setPageNumSet(pageNumSet)
            }
        }).then(()=>setLoading(false));
    }
    const goPrev = () => (e)=> {
        const pagenum = pageNumSet[option]
        let prevnum = pagenum-5>0?pagenum-5:1
        if(pagenum!==prevnum) getData(prevnum)
    }

    const goNext = () => (e)=> {
        const pagenum = pageNumSet[option]
        const lastPage = lastPageSet[option]
        let nextnum = pagenum+5<lastPage?pagenum+5:lastPage
        if(pagenum!==nextnum) getData(nextnum)
    }

    const pagenum = pageNumSet[option]
    const numList = [];
    const lastPage = lastPageSet[option];
    
    for(let i=pagenum-3;i<pagenum+4;i++){
        if(i>0 && i<=lastPage){
            if(i===pagenum){
                numList.push(<a href="# " className="mypage_pagenum mypage_page_on" key={i} value={i} 
                onClick={pagnation(i)}>{i}</a>)
            }else{
                numList.push(<a href="# " className="mypage_pagenum" key={i} value={i} 
                onClick={pagnation(i)}>{i}</a>)
            }
        }
    }
    if(loading) return null;
    return <MyPageMainStyled>
        <MyBoardConnector boards={boardList[option][pagenum]} refreshPage={refreshPage}
            pagenum={pagenum} option={option}
            goNext={goNext} goPrev={goPrev}
            num_list={numList}/>
    </MyPageMainStyled>
}

const MyPageMainStyled = styled.div`
    position: relative;
    padding:0px 5px;
`

export default withRouter(authWrapper(MyPageMain))