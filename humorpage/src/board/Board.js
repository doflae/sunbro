import React, {useState, useRef, useEffect} from "react"
import ReactDOM from "react-dom"
import userDefaultImg from "../static/img/userDefault.png";
import CommentBox from "../comment/CommentBox";
import { Link } from "react-router-dom";
import {sanitizeNonNull, 
    getTime, 
    convertUnitOfNum, 
    copyToClipboard} from "../utils/Utils"
import {authWrapper} from "../auth/AuthWrapper"
import {boardWrapper} from "./BoardWrapper"
import {uploadWrapper} from "../upload/UploadWrapper"
import Axios from "axios"
import styled from "styled-components"
import {IconStyled} from "../MainStyled"
import ReactHlsPlayer from "react-hls-player"

const caches = {};

function Board({
    board,setRef,...props
}){
    const cache = board.id in caches? caches[board.id]:{};
    const [content, setContent] = useState(cache.content || board.content);
    const [onOff, setOnOff] = useState(cache.onOff ||
                                    {onOff:!board.more,
                                        controled:false});
    const [offset, setOffset] = useState(null);
    const [dUpBtnOnOff, setDUpBtnOnOff] = useState(false);
    const [isDeleted, setIsDeleted] = useState(cache.isDeleted || false);
    const boardRef = useRef();
    const commentBtnRef = useRef();
    const id = board.id
    const comments_num = board.comments_num

    //todo:update후 바로 적용
    const UpdateBoard = ()=> async (e)=>{
        props.setBoardKey(id).then(()=>{
            props.onOffUploadPage(1)
        })
    }

    useEffect(()=>{
        return ()=>{
            caches[board.id] = {content:content,onOff:onOff,isDeleted:isDeleted}
        }
    },[onOff,isDeleted,content])

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

    const setControlOnOff = (onoff) =>{
        setOnOff({onOff:onoff,controled:true})
    }

    const measure = ()=>{
        if(onOff.controled && boardRef.current){
            props.measure(props.idx)
            setOnOff({onOff:onOff.onOff,controled:false})
        }
    }
    
    const _measure = () =>{
        console.log("remeasure")
        props.measure(props.idx)
    }


    const ShareBoard = () => (e) =>{
        //todo:배포시 변경
        const shareUrl = "http://localhost:3000/board/"+id
        if(copyToClipboard(shareUrl)!==false){
            console.log("hi")
        }
    }

    if(board==null) return null;
    const isAuthor = props.user!=null && board.authorNum===props.user.userNum;
    if(isDeleted) return null;
    return (
            <BoardPaddingStyled
                className="ng-board-main"
                style={props.style}
                ref = {boardRef}>
                <BoardStyled >
                    <BoardTop>
                        <BoardTopLeft>
                        <BoardAuthorImageStyled src={"/api/file/get?name=/72"+board.authorImg}
                            alt="" onError={(e)=>{
                                e.target.onError=null;e.target.src=userDefaultImg;
                            }}/>
                        </BoardTopLeft>
                        <BoardTopCenter className="board_top_center">
                            <AuthorName><Link to={`/userpage/${board.authorNum}`}>{board.authorName}</Link></AuthorName>
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
                        <MainContentComponent content={content} 
                        measure={measure}
                        thumbnail={board.thumbnail} onOff={onOff.onOff}></MainContentComponent>
                    </div>
                    <div>
                        <GetDetailBtn
                            id = {id}
                            isMore={board.more}
                            onOff={onOff}
                            setControlOnOff = {setControlOnOff}
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
            </BoardPaddingStyled>
    )
}


const GetDetailBtn = ({...props}) => {
    let detailBtnRef = useRef();

    const getDetail = () => async (e) =>{
        let target = e.target
        if(props.onOff.onOff){
            //접기
            target.innerText="펼치기"
            detailBtnRef.current.style.marginTop = "-35px";
            props.setControlOnOff(false)
            window.scrollTo({top:props.offset,behavior:'smooth'})
        }else{
            //펼치기
            //펼치기 전에 아래글의 offsetTop 저장
            const current = props.boardRef.current
            //더보기 버튼 위치 조정
            detailBtnRef.current.style.marginTop = "0px";
            //header height 감안
            props.setOffset(current.offsetTop + current.offsetHeight + 50)
            target.innerText="접기"
            if(props.content==null){
                await Axios({method:"get",url:`/board/content/${props.id}`}).then((res)=>{
                    if(res.status===200){
                        props.setContent(res.data.data)
                    }
                })
            }
            props.setControlOnOff(true)
            window.scrollTo({top:current.offsetTop+60,behavior:'smooth'})
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

const MainContentComponent = ({content,thumbnail,onOff,...props}) =>{
    const boardRef = useRef()
    useEffect(()=>{
        if(boardRef){
            const root = boardRef.current
            root.querySelectorAll(".ng-img-div").forEach(elem=>{
                var img = new Image()
                img.src = elem.firstChild.getAttribute("src")
                img.onload = () =>{
                    elem.firstChild.classList.add('loaded');
                }
                var imgLarge = new Image();
                imgLarge.src = elem.dataset.lg
                imgLarge.onload = () =>{
                    imgLarge.classList.add("loaded")
                }
                elem.appendChild(imgLarge)
            })
            root.querySelectorAll(".playBtn-2").forEach(elem=>{
                elem.onclick = () =>{
                    elem.style.display="none";
                    const p = elem.parentElement
                    p.removeChild(p.firstElementChild)
                    ReactDOM.render(<ReactHlsPlayer
                        src={p.dataset.url}
                        autoPlay={true}
                        controls={true}
                        width="auto"
                        height="auto"
                      />,p)
                }
            })
            root.querySelectorAll(".ng-thumb").forEach(elem=>{
                elem.style.removeProperty("display");
            })
            props.measure()
        }
    },[onOff])
    if(onOff){
        return <div ref={boardRef} 
                dangerouslySetInnerHTML={{__html:sanitizeNonNull(content)}}/>
    }else{
        return <BoardThumbnailStyled
        ref = {boardRef}
        dangerouslySetInnerHTML={{__html:sanitizeNonNull(thumbnail)}}/>
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

const BoardPaddingStyled = styled.div`
    padding:5px 0px;
`

const BoardStyled = styled.div`
    border-radius:10px;
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