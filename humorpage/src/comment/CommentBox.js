import React, {useEffect, useState} from 'react';
import Comment from './Comment'
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import CommentUploader from "./CommentUploader"
import styled from "styled-components"

function CommentBox({
    ...props
}){
    const [commentList, setCommentList] = useState([]);
    const [lastId, setLastId] = useState(null);
    const [keyList, setKeyList] = useState(new Set());
    const [onOff, setOnOff] = useState(false);
    const [onOffSeeMore, setOnOffSeeMore] = useState(false);
    const commentCnt = props.comment_cnt

    useEffect(()=>{
        const target = props.commentBtnRef.current
        target.onclick = () =>{
            if(commentList.length===0){
                getData();
            }
            setOnOff(!onOff)
        }
    })

    useEffect(()=>{
        if(commentList.length>=commentCnt){
            setOnOffSeeMore(false);
        }else{
            setOnOffSeeMore(true);
        }
    },[commentList,commentCnt])

    const getData = () =>{
        const id = props.board_id
        let resturl = `/comment/list?board_id=${id}`
        if(lastId){
            resturl+=`&comment_id=${lastId}`
        }
        props.request("get",resturl).then(res=>{
            if(res.status===200) return res.data
        }).then(res=>{
            let temp = [];
            let resLastId = 0;
            res.list.forEach((comment)=>{
                if(!keyList.has(comment.id)){
                    keyList.add(comment.id)
                    temp.push(comment)
                }
                resLastId = comment.id
            })
            setCommentList(commentList.concat([...temp]));
            setLastId(resLastId)
            setKeyList(keyList)
        })
    }

    const seeMore = () => (e) =>{
        getData();
    }
    
    const appendComment = (comment) =>{
        keyList.add(comment.id)
        setCommentList(commentList.concat(comment))
        setKeyList(keyList)
    }

    const CommentListRender = (commentList, board_id) => {
        if(commentList.length===0) return "첫 댓글을 달아주세요"
        return commentList.map(c =>
            <Comment key={c.id} comment={c} board_id={board_id}/>
        )
    }

    if(onOff===false) return null;
    return <CommentBoxStyled>
        {CommentListRender(commentList,props.board_id)}
        <SeeMoreBtn on={onOffSeeMore} seeMore={seeMore}/>
        <CommentUploader board_id={props.board_id}
                    comment_id={0}
                    appendComment={appendComment}/>
    </CommentBoxStyled>
}

const SeeMoreBtn = ({on, seeMore}) =>{
    if(on===true) return <div><button onClick={seeMore()}>더보기</button></div>
    else return null
}

const CommentBoxStyled = styled.div`
    width: 100%;
    margin-top: 10px;
    padding-top: 20px;
    padding-bottom: 20px;
`

export default authWrapper(withRouter(CommentBox));
