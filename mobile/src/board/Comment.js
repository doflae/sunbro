import React, {useState, useRef} from "react";
import userDefaultImg from "../static/img/user_32x.png";
import {faHeart as rHeart} from "@fortawesome/free-regular-svg-icons"
import {faHeart as sHeart} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter, Link, useHistory} from "react-router-dom"
import {sanitizeHarder, 
		getTime, 
		convertUnitOfNum, 
		isEmpty} from "../utils/Utils"
import Axios from "axios";
import RecommentConnector from "./RecommentConnector"
import styled from "styled-components"
import CommentUploader from "./CommentUploader"

const Comment = ({...props}) =>{
	const c = props.comment
	const [keyList, setKeyList] = useState(new Set());
	const [recommentList,setRecommentList] = useState([]);
	const [recommentLastId,setRecommentLastId] = useState(0);
	const [uploaderSetting, setUploaderSetting] = useState({
		onOff:false,
		target:null
	})
	const [isDeleted, setIsDeleted] = useState(false);
	const [recommentOnId, setRecommentOnId] = useState(0);
	const [onOffrecomment, setOnOffrecomment] = useState(false);
	const [onOffSeeMore, setOnOffSeeMore] = useState(true);

	const getData = () => {
		let resturl = `/comment/list?parent_id=${c.id}`
		if(recommentLastId>0){
			resturl+=`&comment_id=${recommentLastId}`
		}
		return Axios.get(resturl).then(res=>{
			if(res.status===200){
				return res.data
			}
		}).then(res=>{
			let temp = [];
			let resLastId = 0;
			res.list.forEach(c=>{
				if(!keyList.has(c.id)){
					keyList.add(c.id)
					temp.push(c)
				}
				resLastId=c.id
			})
			setRecommentList(recommentList.concat([...temp]))
			setRecommentLastId(resLastId)
			setKeyList(keyList)
			if(res.list.length<10) setOnOffSeeMore(false);
		})
	}

	const deleteHandler = () => (e) =>{
		if(window.confirm("삭제하시겠습니까?")){
            const formData = new FormData();
            formData.append("comment_id",c.id)
            Axios.post("/comment/delete",formData).then(res=>{
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

	const recommentClickHandler = (id,authorName) => {
		if(id===recommentOnId){
			setUploaderSetting({
				onOff:false,
				target:authorName
			})
			setRecommentOnId(0);
		}else{
			setUploaderSetting({
				onOff:true,
				target:authorName
			})
			setRecommentOnId(id);
		}
	}
	const appendComment = (comment) =>{
		keyList.add(comment.id)
		setRecommentList(recommentList.concat([comment]))
		setKeyList(keyList)
		setOnOffrecomment(true)
	}

	const getRecomment = () => (e) =>{
		if(onOffrecomment===false){
			getData().then(
				setOnOffrecomment(!onOffrecomment)
			)
		}else{
			setOnOffrecomment(!onOffrecomment)
		}
	}

	if(c==null) return null;
	if(isDeleted) return null;
	return <CommentStyled>
			<CommentUserImageStyled className="comment-userimg" src={"/api/file/get?name=/72"+c.author.userImg} alt="" onError={(e)=>{
					e.preventDefault(); e.target.onerror=null;e.target.src=userDefaultImg;
				}}/>
				
				<div className="comment-main">
					<div className="comment-subscript">
						<div className="comment-left">
							<div className="comment-author">
								<Link to={`/userpage/${c.author.usernum}`}>{c.author.name}</Link>
							</div>
							<div className="comment-others">
								{getTime(c.created)}
							</div>
							<DeleteCommentBtn
								author_num={c.author.userNum}
								user={props.user}
								deleteHandler={deleteHandler}
							/>
						</div>
						<div className="comment-right">
							<CommentLikeBtn id={c.id} like={c.like} likes={c.likes}/>
							<RecommentBtn recommentClick={recommentClickHandler}
								authorName={c.author.name}
								id={c.id}
								onOff={recommentOnId===c.id}/>
						</div>
					</div>
					<CommentContext 
						content={c.content} 
						media={c.media}
						blob={c.blob}/>
					<ConnectorBtn onClick={getRecomment}
						cnt={c.children_cnt}/>
				<RecommentConnector id={c.id} 
						onOff={onOffrecomment}
						getData={getData}
						recommentOnId={recommentOnId}
						recommentList={recommentList}
						recommentClickHandler={recommentClickHandler}
						onOffSeeMore={onOffSeeMore}/>
				<CommentUploader 
						onOff = {uploaderSetting.onOff}
						cname = {uploaderSetting.target}
						board_id={props.board_id}
						comment_id={c.id}
						appendComment={appendComment}/>
			</div>
	</CommentStyled>
}

const ConnectorBtn = ({cnt,onClick})=>{
	if(cnt>0) return <button onClick={onClick()}> 답글 {convertUnitOfNum(cnt)} </button>
	else return null;
}

export const CommentLikeBtn = ({id,like,likes}) =>{

	const [likeCnt,setLikeCnt] = useState({
		like:like,
		cnt:likes
	})
	const likeBtnRef = useRef();
	let history = useHistory();

	const likeHandler = () => (e) => {
		if(likeCnt.like){
			Axios.get(`/comment/likeoff?id=${id}`).then(res=>{
				if(res.status===200 && !res.data.success){
					history.push("/login")
				}
			})
			setLikeCnt({
				like:!likeCnt.like,
				cnt:likeCnt.cnt-1
			})
		}else{
			Axios.get(`/comment/likeon?id=${id}`).then(res=>{
				if(res.status===200 && !res.data.success){
					history.push("/login")
				}
			})
			setLikeCnt({
				like:!likeCnt.like,
				cnt:likeCnt.cnt+1
			})
		}
	}

	const renderHeartIcon = () =>{
		return <FontAwesomeIcon icon={likeCnt.like?sHeart:rHeart} color="red" size="lg"/>
	}

	return <button className="comment-like" ref = {likeBtnRef} onClick={likeHandler()}>
		좋아요 <span>{convertUnitOfNum(likeCnt.cnt)} </span>
		{renderHeartIcon()}
	</button>
}

export const CommentContext = ({content,media,blob}) =>{
	let src_small =null;
	let src_large = null;
	let largeOnOff = false
	if(blob!=null){
		src_small = Object.keys(blob.commentResizedImg).map(key=>{
			return blob.commentResizedImg[key]
		})
		src_large = blob.commentImg
	}else{
		if(!isEmpty(media)){
			src_small = `/api/file/get?name=/200${media}`
			src_large = `/api/file/get?name=${media}`
		}
	}
	const contentChecked = isEmpty(content)?null:sanitizeHarder(content)
	const ImageClickHandler = () => (e) =>{
		let target = e.target;
		if(largeOnOff){
			target.src = src_small
			target.setAttribute("width","100px")
			target.setAttribute("height","100px")
			largeOnOff=false
		}else{
			target.removeAttribute("width")
			target.removeAttribute("height")
			target.src = src_large
			largeOnOff=true
		}
	}
	const renderImage = () =>{
		if(media!=null || blob!=null) return <CommentImgStyled onClick = {ImageClickHandler()}
		src={src_small} alt="" 
		width="100px" height="100px"
		onLoad={e=>{e.target.style.removeProperty("display");}}
		onError = {e=>{e.preventDefault(); e.target.onerror=null; e.target.style.display="none";}}/>
		else return null
	}
	return <CommentContextStyled>
		<p dangerouslySetInnerHTML={{__html:contentChecked}}></p>
		{renderImage()}		
	</CommentContextStyled>
}

export const DeleteCommentBtn = ({author_num, deleteHandler, user}) =>{
	if(user==null || author_num!==user.userNum) return null;
	return <CommentDeleteBtnStyled onClick={deleteHandler()}>삭제</CommentDeleteBtnStyled>
}

export const RecommentBtn = ({recommentClick, authorName, onOff, id}) =>{

	return <RecommentBtnStyled onClick={e=>{e.preventDefault();
		recommentClick(id,authorName)}}>{onOff?"답글 접기":"답글 달기"}</RecommentBtnStyled>
}

export const CommentUserImageStyled = styled.img`
	max-width: 32px;
	max-height: 32px;
	border-radius: 16px;
	margin: 0px 10px 10px 5px;
`

export const CommentDeleteBtnStyled = styled.button`
	position: absolute;
	background-color: #e8e8e8;
	cursor: pointer;
	border: none;
	right: 25px;
`

const CommentStyled = styled.div`
	margin-left: 30px;
	margin-right: 30px;
	padding-top: 10px;
	padding-bottom: 10px;
	border-bottom: solid gainsboro 1px;
	display: flex;
`

const RecommentBtnStyled = styled.button`

	margin-left: auto;
	margin-right: 20px;
	background-color: #e8e8e8;
	cursor: pointer;
	border: none;
`

const CommentImgStyled = styled.img`
	margin-top: 5px;
`
const CommentContextStyled = styled.div`
	padding-top:5px;
	& *{
		white-space:pre-wrap;
	}
`

export default withRouter(authWrapper(Comment));