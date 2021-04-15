import React, {useState, useRef} from "react";
import userDefaultImg from "../static/img/userDefault.png";
import Merge from "../static/img/merge.png";
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
			<CommentUserImageStyled src={"/api/file/get?name=/72"+c.author.userImg} alt="" onError={(e)=>{
					e.preventDefault(); e.target.onerror=null;e.target.src=userDefaultImg;
				}}/>
				
				<CommentMainStyled>
					<CommentSubsciprtStyled>
						<CommentLeftStyled>
							<CommentAuthorStyled>
								<Link to={`/userpage/${c.author.usernum}`}>{c.author.name}</Link>
								</CommentAuthorStyled>
							<div>
								{getTime(c.created)}
							</div>
						</CommentLeftStyled>
						<CommentRightStlyed>
							<CommentLikeBtn id={c.id} like={c.like} likes={c.likes}/>
							<RecommentBtn recommentClick={recommentClickHandler}
								authorName={c.author.name}
								id={c.id}
								onOff={recommentOnId===c.id}/>
							<DeleteCommentBtn
								author_num={c.author.userNum}
								user={props.user}
								deleteHandler={deleteHandler}
							/>
						</CommentRightStlyed>
					</CommentSubsciprtStyled>
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
			</CommentMainStyled>
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
		const target = likeBtnRef.current
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
			target.style.removeAttribute('filter');
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
			//todo:color filter
		}
	}

	return <React.Fragment>
		<CommentLikeBtnStyled  onClick={likeHandler()}>
			좋아요 {convertUnitOfNum(likeCnt.cnt)}
		</CommentLikeBtnStyled>
		<LikeBtn ref = {likeBtnRef} onClick={likeHandler()}/>
	</React.Fragment>
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
	background-color: #e8e8e8;
	cursor: pointer;
	border: none;
	margin-left:5px;
`

const CommentMainStyled = styled.div`
	width: 100%;
`

const CommentSubsciprtStyled = styled.div`
	font-size: 0.8em;
	padding-top: 2px;
	display:flex;
`

const CommentLeftStyled = styled.div`
	display:flex;
	position:relative;
`

const CommentAuthorStyled = styled.div`
	font-weight: 500;
	margin-right: 10px;
`

const CommentRightStlyed = styled.div`
	right: 0;
	float: right;
	margin-left: auto;
	display:flex;
`

const CommentLikeBtnStyled = styled.button`
	background-color: #e8e8e8;
	display:flex;
	position:relative;
	border: none;
`
//todo:colorfilterneed
const LikeBtn = styled.div`
	width:24px;
	height:24px;
	background-image:url(${Merge});
	background-repeat: no-repeat;
	background-position: -32px -32px;
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