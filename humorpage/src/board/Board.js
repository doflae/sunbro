import React, {useState, useRef, useEffect} from "react"
import userDefaultImg from "../static/img/user_32x.png";
import CommentBox from "./CommentBox";
import { useHistory, Link } from "react-router-dom";
import {sanitizeNonNull, getTime, convertUnitOfNum} from "../utils/Utils"
import {authWrapper} from "../auth/AuthWrapper"
import {boardWrapper} from "./BoardWrapper"
import Axios from "axios"
import styled from "styled-components"

function Board({
    board,setRef,...props
}){
    const [content, setContent] = useState(board.content);
    const [onOff, setOnOff] = useState(!board.more);
    const [offset, setOffset] = useState(null);
    const boardRef = useRef();
    const CommentBtnRef = useRef();
    let history = useHistory();
    const id = board.id
    const comments_num = board.comments_num
    const thumbnail = {thumbnail:board.thumbnail,thumbnailImg:board.thumbnailImg};
    useEffect(()=>{
        if(boardRef.current) setRef(boardRef.current)
    },[boardRef,setRef])
    const UpdateBoard = ()=>(e)=>{
        if(props.user==null) history.push("/login")
        if(props.user.usernum===board.author.usernum){
            if(board.content==null){
                Axios.get(`/board/content/${id}`).then((res)=>{
                    if(res.status===200){
                        board.content=res.data.data
                        props.setBoard(board)
                        history.push(`/update/${id}`)
                    }
                })
            }else{
                props.setBoard(board);
                history.push(`/update/${id}`)
            }
        }
    }
    const DeleteBoard = ()=>(e)=>{
        if(window.confirm("삭제하시겠습니까?")){
            const formData = new FormData();
            formData.append("boardList",[id])
            Axios.post("/board/delete",formData).then(res=>{
                if(res.status===200) return res.data
            }).then(res=>{
                if(res.success){
                    history.push("/boards");
                    history.go();
                }else{
                    alert("해당 글의 작성자가 아닙니다.");
                }
            })
        }
    }
    const renderDelUpBtn = () =>{
        if(board==null||props.user==null) return null;
        if(board.author.usernum===props.user.usernum){
            return <React.Fragment>
                <UpdateDeleteBtnStyled onClick={UpdateBoard()}>수정</UpdateDeleteBtnStyled>
                <UpdateDeleteBtnStyled onClick={DeleteBoard()}>삭제</UpdateDeleteBtnStyled>
            </React.Fragment>
        }
    }
    if(board==null) return null;
    if(board.author==null){
        board.author = {usernum:"#",name:"@user123",userImg:""}
    }
    return <BoardStyled ref = {boardRef}>
        <BoardTop>
            <BoardTopLeft>
            <BoardAuthorImageStyled src={"/file/get?name=/72"+board.author.userImg}
                alt="" onError={(e)=>{
                    e.target.onError=null;e.target.src=userDefaultImg;
                }}/>
            </BoardTopLeft>
            <BoardTopCenter className="board_top_center">
                <AuthorName><Link to={`/userpage/${board.author.usernum}`}>{board.author.name}</Link></AuthorName>
                <Created className="created">{getTime(board.created)}</Created>
            </BoardTopCenter>
            <BoardTopRight>
                {renderDelUpBtn()}
            </BoardTopRight>
        </BoardTop>
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
    </BoardStyled>
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
                Axios({method:"get",url:`/board/content/${props.id}`}).then((res)=>{
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
            <BoardThumbnailImg  alt="" 
                src={thumbnail.thumbnailImg} onError={(e)=>{
                e.target.onError=null; e.target.style.display="none"}}/>
            <BoardThumbnailText dangerouslySetInnerHTML={{__html:sanitizeNonNull(thumbnail.thumbnail)}}>
            </BoardThumbnailText>
        </React.Fragment>
    }
}

const BoardStyled = styled.div`
    padding: 3px 5px 8px 5px;
    border-bottom:1px solid rgba(94,93,93,0.418);
    margin-top:4px;
    margin-bottom:4px;
    box-shadow:rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
`

const UpdateDeleteBtnStyled = styled.button`
    background-color:#fff;
    border:1px solid rgb(0 0 0 / 24%);
    margin:3px;
    border-radius:3px;
    &:focus{
        border:1px solid rgb(0 0 0 / 24%);
    }
`

const AuthorName = styled.p`
    font-size: 1em;
    font-weight: 700;
`

const Created = styled.p`
    margin-top: 3px;
    font-size:0.8em;
`

const BoardTop = styled.div`
    margin-top:10px;
`

const BoardTopLeft = styled.div`
    display:inline-block;
`
const BoardTopCenter = styled.div`
    display:inline-block;
    padding-left:1em;
    vertical-align:top;
`

const BoardTopRight = styled.div`
    display:inline-block;
    float:right;
    margin-top:5px;
`

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
    border:0px 0px 1px 0px;
    margin: 10px 0 10px 0;
    padding-left:5px;
    padding-right:5px;
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


export default boardWrapper(authWrapper(Board));