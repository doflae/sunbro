import React, {useState, useRef, useEffect} from "react"
import userDefaultImg from "../static/img/userDefault.png";
import CommentBox from "../comment/CommentBox";
import { Link } from "react-router-dom";
import {sanitizeNonNull, getTime, convertUnitOfNum, copyToClipboard} from "../utils/Utils"
import {authWrapper} from "../auth/AuthWrapper"
import {boardWrapper} from "./BoardWrapper"
import {uploadWrapper} from "../upload/UploadWrapper"
import Axios from "axios"
import styled from "styled-components"
import {IconStyled} from "../MainStyled"

function Board({
    board,setRef,...props
}){
    const [content, setContent] = useState(board.content);
    const [onOff, setOnOff] = useState(!board.more);
    const [offset, setOffset] = useState(null);
    const [dUpBtnOnOff, setDUpBtnOnOff] = useState(false);
    const [isDeleted, setIsDeleted] = useState(false);
    const boardRef = useRef();
    const commentBtnRef = useRef();
    const id = board.id
    const comments_num = board.comments_num
    const thumbnail = {thumbnail:board.thumbnail,thumbnailImg:board.thumbnailImg};

    useEffect(()=>{
        if(setRef!=null && boardRef.current) setRef(boardRef.current)
    },[boardRef,setRef])

    const UpdateBoard = ()=> async (e)=>{
        props.setBoardKey(id).then(()=>{
            props.onOffUploadPage(1)
        })
    }

    const DeleteBoard = ()=>(e)=>{
        if(window.confirm("삭제하시겠습니까?")){
            const formData = new FormData();
            formData.append("boardList",[id])
            Axios.post("/board/delete",formData).then(res=>{
                if(res.status===200) return res.data
            }).then(res=>{
                if(res.success){
                    setIsDeleted(true);
                }else{
                    alert("해당 글의 작성자가 아닙니다.");
                }
            })
        }
    }


    const ShareBoard = () => (e) =>{
        //todo:배포시 변경
        const shareUrl = "http://localhost:3000/board/"+id
        if(copyToClipboard(shareUrl)!==false){
            console.log("hi")
        }
    }

    if(board==null) return null;
    if(board.author==null){
        board.author = {userNum:"#",name:"@user123",userImg:""}
    }
    const isAuthor = props.user!=null && board.author.userNum===props.user.userNum;
    if(isDeleted) return null;
    return <BoardStyled ref = {boardRef}>
        <BoardTop>
            <BoardTopLeft>
            <BoardAuthorImageStyled src={"/api/file/get?name=/72"+board.author.userImg}
                alt="" onError={(e)=>{
                    e.target.onError=null;e.target.src=userDefaultImg;
                }}/>
            </BoardTopLeft>
            <BoardTopCenter className="board_top_center">
                <AuthorName><Link to={`/userpage/${board.author.usernum}`}>{board.author.name}</Link></AuthorName>
                <Created className="created">{getTime(board.created)}</Created>
            </BoardTopCenter>
            <BoardTopRight>
                <BoardControlBtn
                    setDUpBtnOnOff={setDUpBtnOnOff}
                    dUpBtnOnOff={dUpBtnOnOff}
                />
                <BoardControls
                    btnOnOff={dUpBtnOnOff}
                    isAuthor={isAuthor}
                    UpdateBoard={UpdateBoard}
                    DeleteBoard={DeleteBoard}
                />
            </BoardTopRight>
        </BoardTop>
        <BoardTitleStyled>
            {board.title}
        </BoardTitleStyled>
        <div className="board_main">
            <MainContentComponent content={content} thumbnail={thumbnail} onOff={onOff}></MainContentComponent>
        </div>
        <div>
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
            <BoardBottomButtonStyled>
                <LikeBtn id={id} like={board.like} likes={board.likes}/>
                <CommentBtnStyled
                    ref={commentBtnRef}>
                    <CommentIconStlyed
                        theme="comment_lg"/>
                    <NumberStyled>
                        {convertUnitOfNum(board.total_comments_num)}
                    </NumberStyled>
                </CommentBtnStyled>
                <ShareBtnStyled>
                    <IconStyled
                    theme="share_lg"
                    onClick={ShareBoard()}/>
                </ShareBtnStyled>   
            </BoardBottomButtonStyled>
        </div>
        <CommentBox 
            board_id={id}
            comment_cnt = {comments_num} 
            commentBtnRef = {commentBtnRef}
            failedHandler={()=>{setIsDeleted(true)}}/>
    </BoardStyled>
}


const GetDetailBtn = ({...props}) => {
    let detailBtnRef = useRef();

    const getDetail = () => async (e) =>{
        let target = e.target
        if(props.onOff){
            //접기
            target.innerText="펼치기"
            detailBtnRef.current.style.marginTop = "-35px";
            props.setOnOff(false)
            window.scrollTo({top:props.offset,behavior:'smooth'})
        }else{
            //펼치기
            //펼치기 전에 아래글의 offsetTop 저장
            const current = props.boardRef.current
            detailBtnRef.current.style.marginTop = "0px";
            //header height 감안
            props.setOffset(current.offsetTop + current.offsetHeight - 50)
            window.scrollTo({top:current.offsetTop-50,behavior:'smooth'})
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
    else return <GetDetailBtnStyled ref = {detailBtnRef}
        onClick={getDetail()}>더 보기(more)</GetDetailBtnStyled>
}

const LikeBtn = authWrapper(({id,like,likes,...props}) =>{
    const [onOffLike, setOnOffLike] = useState({
        onOff:like,
        likeCnt:likes
    })
    const likeHandler = ()=>(e) =>{
        if(onOffLike.onOff){
            Axios.get(`/board/likeoff?id=${id}`).then(res=>{
                if (!res.data.success){
                    props.setAuthPageOption(0);
                }
            })
            setOnOffLike({
                onOff:false,
                likeCnt:onOffLike.likeCnt-1
            })
        }else{
            Axios.get(`/board/likeon?id=${id}`).then(res=>{
                if (!res.data.success){
                    props.setAuthPageOption(0);
                }
            })
            setOnOffLike({
                onOff:true,
                likeCnt:onOffLike.likeCnt+1
            })
        }
    }
    if(onOffLike.onOff===true){
        return <LikeStyled
            onClick={likeHandler()}>
                <LikeBtnStyled 
                theme="like_lg"
                color="invert(34%) sepia(88%) saturate(862%) hue-rotate(329deg) brightness(98%) contrast(98%)"/>
            <NumberStyled>
                {convertUnitOfNum(onOffLike.likeCnt)}
            </NumberStyled>
        </LikeStyled>
    }else{
        return <LikeStyled 
            onClick={likeHandler()}>
            <LikeBtnStyled theme="like_lg"/>
            <NumberStyled>
                {convertUnitOfNum(onOffLike.likeCnt)}
            </NumberStyled>
        </LikeStyled>
    }
})

const BoardControlBtn = ({setDUpBtnOnOff, dUpBtnOnOff}) =>{
    return <BoardControlBtnStlyed 
            tabIndex = {0}
            onClick={()=>{
                setDUpBtnOnOff(!dUpBtnOnOff)
            }}
            onBlur={()=>{
                setTimeout(()=>setDUpBtnOnOff(false),100);
            }}>
        <DotIconStyled/>
    </BoardControlBtnStlyed>
}

const BoardControls = ({btnOnOff, isAuthor, UpdateBoard, DeleteBoard}) =>{
    if(isAuthor && btnOnOff){
        return <BoardControlsStlyed>
            <UpdateDeleteBtnStyled onClick={UpdateBoard()}>수정</UpdateDeleteBtnStyled>
            <UpdateDeleteBtnStyled onClick={DeleteBoard()}>삭제</UpdateDeleteBtnStyled>
        </BoardControlsStlyed>
    }
    return null;
}

const MainContentComponent = ({content,thumbnail,onOff}) =>{
    if(onOff===true){
        return <BoardDetailStyled dangerouslySetInnerHTML={{__html:sanitizeNonNull(content)}}></BoardDetailStyled>
    }else{
        return <BoardThumbnailStyled>
            <BoardThumbnailImg  alt="" 
                src={thumbnail.thumbnailImg} onError={(e)=>{
                e.target.onError=null; e.target.style.display="none"}}/>
            <BoardThumbnailText dangerouslySetInnerHTML={{__html:sanitizeNonNull(thumbnail.thumbnail)}}>
            </BoardThumbnailText>
        </BoardThumbnailStyled>
    }
}


const BoardControlsStlyed = styled.div`
    position: absolute;
    top: 44px;
    right: 8px;
    background-color: #fff;
    padding:5px 15px;
    box-shadow:0px 0px 2px 1px rgb(0,0,0,24%);
    &::after {
        content: "";
        position: absolute;
        border-top: 0px solid transparent;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-bottom: 8px solid #fff;
        right: 6px;
        top: -8px;
    }
`

const BoardControlBtnStlyed = styled.div`
    width:45px;
    height:45px;
    border-radius:50%;
    cursor:pointer;
    &:hover {
        background-color:rgb(0,0,0,7%);
    }
`
const DotIconStyled = styled.div`
    background-color:#000;
    width:5px;
    height:5px;
    position:relative;
    border-radius:50%;
    top:12.5px;
    margin:auto;
    &::before, &::after{
        background-color:#000;
        content:" ";
        position:absolute;
        display:inline-block;
        width:5px;
        height:5px;
        border-radius:50%;
    }

    &::before{
        top:12px;
    }

    &::after{
        top:6px;
    }
`

const BoardBottomButtonStyled = styled.div`
    display:flex;
`

const BoardThumbnailStyled = styled.div`
    text-align:center;
`

const BoardStyled = styled.div`
    min-width: 496px;
    max-width: 700px;
    border-radius:10px;
    margin-left:auto;
    background-color: #f9f9f9;
    border-bottom: 1px solid rgba(94,93,93,0.418);
    margin-bottom: 4px;
    box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
`

const UpdateDeleteBtnStyled = styled.div`
    border-bottom:1px solid rgb(0 0 0 / 24%);
    width: max-content;
    cursor:pointer;
    margin-bottom:5px;
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
    padding:15px 10px 0px 10px;
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
    position:relative;  
    float:right;
    margin:-7px -2px 0px 0px;
`

const BoardThumbnailText = styled.span`
    font-size: 1.2em;
    padding: 10px;
    width: 50%;
`

const BoardThumbnailImg = styled.img`
    max-height:500px;
    max-width:500px;
    margin : 5px;
    box-sizing:border-box;
`

const BoardAuthorImageStyled = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 25px;
`

const BoardTitleStyled = styled.div`
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
    margin: 0px 5px 10px 5px;
    padding-left: 10px;
    font-size: 1.5rem;
    font-weight: normal;
    border-bottom: 1px solid rgba(94, 93, 93, 0.15);
    line-height:200%;
`

const BoardDetailStyled = styled.div`
    min-height:300px;
`

const GetDetailBtnStyled = styled.div`
    cursor:pointer;
    position: relative;
    width: 230px;
    border-radius: 9px;
    margin: -30px auto 5px auto;
    text-align: center;
    color: #fff;
    background-color: rgb(92, 164, 214);
    font-size: 1.1em;
    font-weight: 700;
    transition: transform .3s ease-out;
    &:hover{
        transform: translate(0, -5px);
    }
`;

const CommentIconStlyed = styled(IconStyled)`
    filter:invert(53%) sepia(74%) saturate(1309%) hue-rotate(177deg) brightness(89%) contrast(91%);
`

const ShareBtnStyled = styled.div`
    margin:5px;
    opacity:0.5;
    &:hover{
        opacity:1;
    }
`
const NumberStyled = styled.div`
    margin-left:5px;
`
const LikeStyled = styled.div`
    margin:5px 5px 5px 18px;
    display:flex;
    font-size:1.2em;
    line-height:32px;
`

const CommentBtnStyled = styled.div`
    margin:5px;
    display:flex;
    font-size:1.2em;
    line-height:32px;
`

const LikeBtnStyled = styled(IconStyled)`
    filter:${props=>props.color};
`


export default uploadWrapper(boardWrapper(authWrapper(Board)));