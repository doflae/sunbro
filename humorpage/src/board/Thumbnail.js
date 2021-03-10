import React, {useState } from "react"
import userDefaultImg from "../static/img/user_32x.png";
import CommentBox from "./CommentBox";
import { useHistory, Link } from "react-router-dom";
import {sanitizeNonNull, getTime, convertUnitOfNum} from "../utils/Utils"
import {authWrapper} from "../auth/AuthWrapper"
import Axios from "axios"

function Thumbnail({
    board,
    ...props
}){
    let detailElement = null
    let thumbnailElement = null
    const [commentboxOn, setCommentboxOn] = useState(false);
    let on = false
    let history = useHistory();
    const getDetail = () => (e) =>{
        let target = e.target
        let mainTarget = target.parentElement.previousElementSibling
        if(on){
            target.innerText="펼치기"
            target = target.parentElement.parentElement.nextElementSibling
            mainTarget.replaceChild(thumbnailElement,detailElement)
            on=false
        }else{
            target.innerText="접기"
            if(thumbnailElement===null) thumbnailElement = mainTarget.firstChild
            if(detailElement===null){
                var tmp = document.createElement("div")
                tmp.className="board_detail"
                Axios({method:"get",url:`/board/detail/${board.id}`}).then(res=>{
                    tmp.innerHTML = sanitizeNonNull(res.data.data)
                    detailElement = tmp
                    mainTarget.replaceChild(detailElement,thumbnailElement)
                })
            }else{
                mainTarget.replaceChild(detailElement,thumbnailElement)
            }
            target = target.parentElement.parentElement
            on=true
        }
        window.scrollTo({top:target.offsetTop,behavior:'smooth'})
    }

    const getCommentBox = () => (e) =>{
        if(commentboxOn){
            setCommentboxOn(false)
        }else{
            setCommentboxOn(true)
        }
    }

    const like = () => (e) =>{
        let btn;
        if(e.target.lastElementChild){
            btn = e.target
        }else{
            btn = e.target.parentElement
        }
        if(board.like===true){
            props.request('get',`/board/likeoff?id=${board.id}`).then(res=>{
                if (!res.data.success){
                    history.push("/login")
                }
            })
            board.like = false
            btn.classList.toggle("like_on")
            btn.lastElementChild.innerText=board.likes-1
            board.likes-=1
        }else{
            props.request('get',`/board/likeon?id=${board.id}`).then(res=>{
                if (!res.data.success){
                    history.push("/login")
                }
            })
            board.like=true
            btn.classList.toggle("like_on")
            btn.lastElementChild.innerText=board.likes+1
            board.likes+=1
        }
    }
    const id = board.id
    const comments_num = board.comments_num
    return <div className = "board">
        <div className="board_top">
            <div className="board_top_left">
                <img className="author_img" src={board.author.userImg} alt="" onError={(e)=>{
                    e.target.onError=null;e.target.src=userDefaultImg;
                }}/>
            </div>
            <div className="board_top_center">
                <div className="author_name"><Link to={`/userpage/${board.author.usernum}`}>{board.author.name}</Link></div>
                <div className="created">{getTime(board.created)}</div>
            </div>
        </div>
        <div className="board_title">
            {board.title}
        </div>
        <div className="board_main">
            <div className="board_thumbnail">
                <img className="board_thumbnail_img" alt="" srcSet={"/240"+board.thumbnailImg+" 240w"} onError={(e)=>{
                    e.target.onError=null; e.target.srcSet=null}} src={board.thumbnailImg}/>
                <div className="board_thumbnail_text" dangerouslySetInnerHTML={{__html:sanitizeNonNull(board.thumbnail)}}></div>
            </div>
        </div>
        <div className="board_bottom">
            <button className="see_detail" onClick={getDetail()}>펼치기</button>
            <div className="buttons">
                <button className="board_btn" onClick={getCommentBox()}><span>댓글</span><span>{convertUnitOfNum(board.total_comments_num)}</span></button>
                <button className={board.like?("like_btn board_btn like_on"):
            ("like_btn board_btn like_off")}
            onClick={like()}><span>좋아요</span><span>{convertUnitOfNum(board.likes)}</span></button>
                
                <button className="scrap_btn board_btn">공유하기</button>    
            </div>
        </div>
        {commentboxOn?(
            <CommentBox board_id={id} comment_cnt = {comments_num}/>
        ):null
        }
    </div>
}

export default authWrapper(React.memo(Thumbnail));