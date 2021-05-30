import React, {useEffect, useState} from 'react';
import Comment from './Comment'
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import CommentUploader from "./CommentUploader"
import styled from "styled-components"
import {SeeMoreBtnStyled} from "./CommentStyled"

const caches = {};

function CommentBox({
    board_id,comments,...props
}){
    const cache = board_id in caches?caches[board_id]:{};
    const [commentList, setCommentList] = useState(cache.commentList||comments||[]);
    const [lastId, setLastId] = useState(cache.lastId||null);
    const [keyList, setKeyList] = useState(cache.keyList||new Set());
    const [onOffSeeMore, setOnOffSeeMore] = useState(cache.onOffSeeMore||false);


    useEffect(()=>{
        return ()=>{
            caches[board_id] = {
                commentList:commentList,
                lastId:lastId,
                keyList:keyList,
                onOffSeeMore:onOffSeeMore
            }
        }
    },[])

    const getData = () =>{
        const id = board_id
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
            setOnOffSeeMore(!!res.code)
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

    const CommentListRender = () => {
        if(commentList.length===0) return null;
        return commentList.map(c =>
            <Comment key={c.id} comment={c} mediaDir={props.mediaDir}/>
        )
    }

    return <CommentBoxStyled>
        {CommentListRender()}
        <SeeMoreBtn on={onOffSeeMore} seeMore={seeMore}/>
        <CommentUploader board_id={board_id}
                    comment_id={0}
                    failedMsg={"삭제된 글입니다."}
                    mediaDir={props.mediaDir}
                    failedHandler={props.failedHandler}
                    appendComment={appendComment}/>
    </CommentBoxStyled>
}

const SeeMoreBtn = ({on, seeMore}) =>{
    if(on===true) return <SeeMoreBtnStyled onClick={seeMore()}>더보기...</SeeMoreBtnStyled>
    else return null
}


const CommentBoxStyled = styled.div`
    width: 100%;
    padding-bottom: 20px;
`

export default authWrapper(withRouter(CommentBox));
