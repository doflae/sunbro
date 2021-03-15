import React, {useState, useRef} from "react"
import userDefaultImg from "../static/img/user_32x.png";
import CommentBox from "./CommentBox";
import { useHistory, Link } from "react-router-dom";
import {sanitizeNonNull, getTime, convertUnitOfNum} from "../utils/Utils"
import {authWrapper} from "../auth/AuthWrapper"
import Axios from "axios"
import styled from "styled-components"

function Board({
    board
}){
    const [content, setContent] = useState(board.content);
    const [onOff, setOnOff] = useState(!board.more);
    const [offset, setOffset] = useState(null);
    const boardRef = useRef();
    const CommentBtnRef = useRef();
    
    const id = board.id
    const comments_num = board.comments_num
    const thumbnail = {thumbnail:board.thumbnail,thumbnailImg:board.thumbnailImg};
    if(board==null) return null;
    return <div className = "board" ref = {boardRef}>
        <div className="board_top">
            <div className="board_top_left">
            <BoardAuthorImageStyled src={"/file/get?name=/72"+board.author.userImg}
                alt="" onError={(e)=>{
                    e.target.onError=null;e.target.src=userDefaultImg;
                }}/>
            </div>
            <div className="board_top_center">
                <div className="author_name"><Link to={`/userpage/${board.author.usernum}`}>{board.author.name}</Link></div>
                <div className="created">{getTime(board.created)}</div>
            </div>
        </div>
        <BoardTitleStyled>
            {board.title}
        </BoardTitleStyled>
        <div className="board_main">
            <MainContentComponent content={content} thumbnail={thumbnail} onOff={onOff}></MainContentComponent>
        </div>
        <div className="board_bottom">
            <GetDetailBtn 
                id = {id}
                isMore={board.more}
                onOff={onOff}
                setOnOff={setOnOff}
                offset={offset}
                setOffset={setOffset}
                boardRef={boardRef}
                setContent={setContent}
                content={content}
                />
            <div className="buttons">
                <BoardBtn ref={CommentBtnRef}>
                    댓글 {convertUnitOfNum(board.total_comments_num)}
                </BoardBtn>
                <LikeBtn id={id} like={board.like} likes={board.likes}/>
                <BoardBtn>공유하기</BoardBtn>    
            </div>
        </div>
        <CommentBox board_id={id} comment_cnt = {comments_num} CommentBtnRef = {CommentBtnRef}/>
    </div>
}

const GetDetailBtn = ({...props}) => {
    const getDetail = () => async (e) =>{
        let target = e.target
        if(props.onOff){
            //접기
            target.innerText="펼치기"
            props.setOnOff(false)
            window.scrollTo({top:props.offset,behavior:'smooth'})
        }else{
            //펼치기
            //펼치기 전에 아래글의 offsetTop 저장
            const current = props.boardRef.current
            props.setOffset(current.offsetTop + current.offsetHeight)
            window.scrollTo({top:current.offsetTop,behavior:'smooth'})
            target.innerText="접기"
            if(props.content==null){
                Axios({method:"get",url:`/board/detail/${props.id}`}).then((res)=>{
                    console.log(res)
                    if(res.status===200){
                        props.setContent(res.data.data)
                        props.setOnOff(true)
                    }
                })
            }else {
                props.setOnOff(true)
            }
        }
    }
    if(!props.isMore) return null;
    else return <GetDetailBtnStyled onClick={getDetail()}>펼치기</GetDetailBtnStyled>
}

const LikeBtn = ({id,like,likes}) =>{
    const [onOffLike, setOnOffLike] = useState({
        onOff:like,
        likeCnt:likes
    })
    let history = useHistory();
    const likeHandler = ()=>(e) =>{
        if(onOffLike.onOff){
            Axios.get(`/board/likeoff?id=${id}`).then(res=>{
                if (!res.data.success){
                    history.push("/login")
                }
            })
            setOnOffLike({
                onOff:false,
                likeCnt:onOffLike.likeCnt-1
            })
        }else{
            Axios.get(`/board/likeon?id=${id}`).then(res=>{
                if (!res.data.success){
                    history.push("/login")
                }
            })
            setOnOffLike({
                onOff:true,
                likeCnt:onOffLike.likeCnt+1
            })
        }
    }
    if(onOffLike.onOff===true){
        return <LikeOnBtnStyled onClick={likeHandler()}>좋아요 <span>{convertUnitOfNum(onOffLike.likeCnt)}</span></LikeOnBtnStyled>
    }else{
        return <LikeOffBtnStyled onClick={likeHandler()}>좋아요 <span>{convertUnitOfNum(onOffLike.likeCnt)}</span></LikeOffBtnStyled>
    }
}

const MainContentComponent = ({content,thumbnail,onOff}) =>{
    if(onOff===true){
        return <BoardDetailStyled dangerouslySetInnerHTML={{__html:sanitizeNonNull(content)}}></BoardDetailStyled>
    }else{
        return <React.Fragment>
            <BoardThumbnailImg className="board_thumbnail_img" alt="" onError={(e)=>{
                e.target.onError=null; e.target.style.display="none"}} 
                src={thumbnail.thumbnailImg}/>
            <BoardThumbnailText className="board_thumbnail_text" dangerouslySetInnerHTML={{__html:sanitizeNonNull(thumbnail.thumbnail)}}>
            </BoardThumbnailText>
        </React.Fragment>
    }
}

const BoardThumbnailText = styled.span`
    font-size: 1.2em;
    padding: 10px;
    width: 50%;
`

const BoardThumbnailImg = styled.img`
    width : 50%;
    margin : 5px;
    box-sizing:border-box;
`

const BoardAuthorImageStyled = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 25px;
`

const BoardTitleStyled = styled.div`
    border-top: 0px;
    border-left: 0px;
    border-right: 0px;
    margin: 10px 0 10px 0;
    font-size: 1.5rem;
    font-weight: normal;
    border-bottom: 1px solid rgba(94, 93, 93, 0.418);
    line-height:200%;
`

const BoardDetailStyled = styled.div`
    padding:10px;
    min-height:300px;
`

const GetDetailBtnStyled = styled.button`
    width: 100%;
    border: 0px;
`;

const BoardBtn = styled.button`
    display: flex;
    justify-content: space-evenly;
    width: 33%;
    height: 100%;
    border: 0px;
    background-color:#f5f4f4;
    &:hover{
        background-color: #aaaaaa;
    }
`;


const LikeOnBtnStyled = styled.button`
    display: flex;
    justify-content: space-evenly;
    width: 33%;
    height: 100%;
    border: 0px;
    background-color: #f875aa;
`

const LikeOffBtnStyled = styled.button`
    display: flex;
    justify-content: space-evenly;
    width: 33%;
    height: 100%;
    border: 0px;
    background-color:#f5f4f4;
    &:hover{
        background-color: #aaaaaa;
    }
`


export default authWrapper(Board);