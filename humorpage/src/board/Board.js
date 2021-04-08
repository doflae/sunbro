import React, {useState, useRef, useEffect} from "react"
import userDefaultImg from "../static/img/user_32x.png";
import CommentBox from "./CommentBox";
import { useHistory, Link } from "react-router-dom";
import {sanitizeNonNull, getTime, convertUnitOfNum, copyToClipboard} from "../utils/Utils"
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
        if(setRef!=null && boardRef.current) setRef(boardRef.current)
    },[boardRef,setRef])

    const UpdateBoard = ()=>(e)=>{
        if(props.user==null) history.push("/login")
        if(props.user.usernum===board.author.usernum){
            history.push(`/update/${id}`)
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
        if(board.author.userNum===props.user.userNum){
            return <React.Fragment>
                <UpdateDeleteBtnStyled onClick={UpdateBoard()}>수정</UpdateDeleteBtnStyled>
                <UpdateDeleteBtnStyled onClick={DeleteBoard()}>삭제</UpdateDeleteBtnStyled>
            </React.Fragment>
        }
    }

    const ShareBoard = () => (e) =>{
        //배포시 변경
        const shareUrl = "http://localhost:3000/board/"+id
        if(copyToClipboard(shareUrl)!==false){
            console.log("hi")
        }
    }

    if(board==null) return null;
    if(board.author==null){
        board.author = {usernum:"#",name:"@user123",userImg:""}
    }
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
                {renderDelUpBtn()}
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
            <BoardBottomButtons>
                <BoardBtnStyled
                theme={{borderBottom:"0px 10px"}}
                ref={CommentBtnRef}>
                    댓글 {convertUnitOfNum(board.total_comments_num)}
                </BoardBtnStyled>
                <LikeBtn id={id} like={board.like} likes={board.likes}/>
                <BoardBtnStyled
                theme={{borderBottom:"10px 0px"}}
                onClick={ShareBoard()}>공유하기</BoardBtnStyled>    
            </BoardBottomButtons>
        </div>
        <CommentBox board_id={id} comment_cnt = {comments_num} CommentBtnRef = {CommentBtnRef}/>
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
        return <BoardThumbnailStyled>
            <BoardThumbnailImg  alt="" 
                src={thumbnail.thumbnailImg} onError={(e)=>{
                e.target.onError=null; e.target.style.display="none"}}/>
            <BoardThumbnailText dangerouslySetInnerHTML={{__html:sanitizeNonNull(thumbnail.thumbnail)}}>
            </BoardThumbnailText>
        </BoardThumbnailStyled>
    }
}

const BoardBottomButtons = styled.div`
    display:flex;
    justify-content:space-between;
`

const BoardThumbnailStyled = styled.div`
    text-align:center;
`

const BoardStyled = styled.div`
    min-width: 500px;
    max-width: 700px;
    border-radius:10px;
    margin-left:auto;
    background-color: #fff;
    border-bottom: 1px solid rgba(94,93,93,0.418);
    margin-bottom: 4px;
    box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
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
    float:right;
    margin-top:5px;
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
    margin: 10px 5px;
    padding-left: 10px;
    font-size: 1.5rem;
    font-weight: normal;
    border-bottom: 1px solid rgba(94, 93, 93, 0.418);
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

const BoardBtnStyled = styled.button`
    display: flex;
    justify-content: space-evenly;
    width: 33%;
    height: 100%;
    border: 0px;
    background-color:#f5f4f4;
    &:hover{
        background-color: #aaaaaa;
    }
    border-radius: 0px 0px ${props=>props.theme.borderBottom};
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