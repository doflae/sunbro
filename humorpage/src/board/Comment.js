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
	console.log(c)
	const [keyList, setKeyList] = useState(new Set());
	const [recommentList,setRecommentList] = useState([]);
	const [recommentLastId,setRecommentLastId] = useState(0);
	const [uploaderSetting, setUploaderSetting] = useState({
		onOff:false,
		target:null
	})
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
		setRecommentList(recommentList.concat(comment))
		setKeyList(keyList)
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
	return <CommentStyled>
			<img className="comment-userimg" srcSet={"/72"+c.author.userImg+" 72w"} alt="" src={c.author.userImg} onError={(e)=>{
					e.preventDefault(); e.target.onerror=null;e.target.src=userDefaultImg; e.target.removeAttribute("srcset");
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
	console.log(blob)
	let srcset =null;
	let src = null;
	if(blob!=null){
		srcset = Object.keys(blob.commentResizedImg).map(key=>{
			return `${blob.commentResizedImg[key]} ${key}w,`
		}).join("\n")
		src = blob.commentImg
	}else{
		if(!isEmpty(media)){
			src = media
			srcset = `/200${media} 200w`
		}
	}
	const contentChecked = isEmpty(content)?null:sanitizeHarder(content)
	const ImageClickHandler = () => (e) =>{
		let target = e.target;
		if(target.style.maxHeight.endsWith("%")){
			target.style.maxHeight = "120px"
			target.styled.maxWidth = "120px"
		}else{
			target.style.maxHeight = "100%"
			target.styled.maxWidth = "100%"
		}
	}
	return <CommentContextStyled>
		<p dangerouslySetInnerHTML={{__html:contentChecked}}></p>
		<CommentImgStyled onClick = {ImageClickHandler()} srcSet={srcset}
			src={src} alt="" 
			onLoad={e=>{
				setTimeout(()=>console.log("TIME!!!!!!!!!!!!"),60000)
				e.target.style.removeProperty("display")}}
			onError = {e=>{e.preventDefault(); e.target.onerror=null; e.target.style.display="none";}}/>
	</CommentContextStyled>
}

export const RecommentBtn = ({recommentClick, authorName, onOff, id}) =>{

	return <RecommentBtnStyled onClick={e=>{e.preventDefault();
		recommentClick(id,authorName)}}>{onOff?"답글 접기":"답글 달기"}</RecommentBtnStyled>
}
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
	max-width: 120px;
	max-height: 120px;
`
const CommentContextStyled = styled.div`
	padding-top:5px;
	& *{
		white-space:pre-wrap;
	}
`

export default withRouter(authWrapper(Comment));