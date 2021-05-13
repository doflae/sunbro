import React, {useState,useRef, useEffect} from "react";
import userDefaultImg from "../static/img/userDefault.png";
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter, Link, useHistory} from "react-router-dom"
import {sanitizeHarder,
		convertUnitOfNum, 
		isEmpty} from "../utils/Utils"
import Axios from "axios";
import RecommentConnector from "./RecommentConnector"
import * as Styled from "./CommentStyled"
import CommentUploader from "./CommentUploader"

const Comment = ({...props}) =>{
	const [c,setC] = useState(props.comment)
	const [keyList, setKeyList] = useState(new Set());
	const [recommentList,setRecommentList] = useState([]);
	const [recommentLastId,setRecommentLastId] = useState(0);
	const [uploaderSetting, setUploaderSetting] = useState({
		onOff:false,
		target:null
	})
	const [updateMode, setUpdateMode] = useState(false);
	const [isDeleted, setIsDeleted] = useState(false);
	const [recommentOnId, setRecommentOnId] = useState(0);
	const [onOffrecomment, setOnOffrecomment] = useState(false);
	const [onOffSeeMore, setOnOffSeeMore] = useState(true);
	const [loaded, setLoaded] = useState(false);
	const optionRef = useRef()

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
			setOnOffSeeMore(!!res.code)
			setRecommentList(recommentList.concat([...temp]))
			setRecommentLastId(resLastId)
			setKeyList(keyList)
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

	const updateHandler = () => (e) =>{
		setUpdateMode(!updateMode)
	}

	const successHandler = (c) =>{
		setUpdateMode(!updateMode);
		setC(c);
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

	const getDistance = ()=>{
		if(optionRef.current){
			return parseInt(window.getComputedStyle(optionRef.current).marginLeft);
		}
		return 100;
	}

	const getRecomment = () => {
		if(onOffrecomment) return
		getData().then(
			setOnOffrecomment(true)
		)
	}
	useEffect(()=>{
		if(loaded){
			props.measure()
		}
	},[loaded])

	if(c==null) return null;
	if(isDeleted) {
		props.measure()
		return null;
	}
	if(updateMode) return <CommentUploader c={c}
						board_id={props.board_id}
						success={successHandler}
						cancel={updateHandler}/>
	return <React.Fragment>
		<Styled.CommentStyled>
			<Styled.CommentUserImageStyled src={"/api/file/get?name=/72"+c.authorImg} alt="" onError={(e)=>{
					e.preventDefault(); e.target.onerror=null;e.target.src=userDefaultImg;
				}}/>
				
				<Styled.CommentMainStyled>
					<Styled.CommentSubsciprtStyled>
						<Styled.CommentLeftStyled>
							<Styled.CommentAuthorStyled>
								<Link to={`/userpage/${c.authorNum}`}>{c.authorName}</Link>
								</Styled.CommentAuthorStyled>
						</Styled.CommentLeftStyled>
						<ControlCommentBtn
							author_num={c.authorNum}
							user={props.user}
							getDistance={getDistance}
							deleteHandler={deleteHandler}
							updateHandler={updateHandler}
						/>
					</Styled.CommentSubsciprtStyled>
					<CommentContext 
						content={c.content} 
						media={c.media}
						blob={c.blob}
						setLoaded={setLoaded}/>
			</Styled.CommentMainStyled>
			<Styled.CommentOptionStlyed ref = {optionRef}>
				<CommentLikeBtn id={c.id} like={c.like} likes={c.likes}/>
				<RecommentBtn recommentClick={recommentClickHandler}
					authorName={c.authorName}
					id={c.id}
					getRecomment = {getRecomment}
					onOff={recommentOnId===c.id}
					cnt={c.children_cnt}/>
			</Styled.CommentOptionStlyed>
		</Styled.CommentStyled>
		<Styled.RecommentBox>
			<RecommentConnector id={c.id}
					comment_id={c.id}
					board_id={props.board_id}
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
					failedMsg = {"삭제된 댓글입니다."}
					failedHandler={()=>{setIsDeleted(true)}}
					appendComment={appendComment}/>
		</Styled.RecommentBox>
	</React.Fragment>
}
export const CommentLikeBtn = ({id,like,likes}) =>{

	const [likeCnt,setLikeCnt] = useState({
		like:like,
		cnt:likes
	})
	const [filter,setFilter] = useState(like?
		"invert(53%) sepia(74%) saturate(1309%) hue-rotate(177deg) brightness(89%) contrast(91%)":
		"")
	let history = useHistory();

	const likeHandler = () => (e) => {
		if(likeCnt.like){
			Axios.get(`/comment/like/off?id=${id}`).then(res=>{
				if(res.status===200 && !res.data.success){
					history.push("/login")
				}
			})
			setLikeCnt({
				like:!likeCnt.like,
				cnt:likeCnt.cnt-1
			})
			setFilter("")
		}else{
			Axios.get(`/comment/like/on?id=${id}`).then(res=>{
				if(res.status===200 && !res.data.success){
					history.push("/login")
				}
			})
			setLikeCnt({
				like:!likeCnt.like,
				cnt:likeCnt.cnt+1
			})
			setFilter("invert(34%) sepia(88%) saturate(862%) hue-rotate(329deg) brightness(98%) contrast(98%)")
		}
	}

	return <Styled.LikeStyled>
		<Styled.LikeBtnStyled
		color={filter}
		theme="like_sm"
		onClick={likeHandler()}/>
		<Styled.NumberStyled>
			{convertUnitOfNum(likeCnt.cnt)}
		</Styled.NumberStyled>
	</Styled.LikeStyled>
}

export const CommentContext = ({content,media,blob,...props}) =>{
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
		if(media!=null || blob!=null) return <Styled.CommentImgStyled onClick = {ImageClickHandler()}
		src={src_small} alt="" 
		width="100px" height="100px"
		onLoad={e=>{e.target.style.removeProperty("display");}}
		onError = {e=>{e.preventDefault(); e.target.onerror=null; e.target.style.display="none";}}/>
		else return null
	}
	useEffect(()=>{
		props.setLoaded(true)
	},[])
	return <Styled.CommentContextStyled>
		<p dangerouslySetInnerHTML={{__html:contentChecked}}></p>
		{renderImage()}		
	</Styled.CommentContextStyled>
}

export const ControlCommentBtn = ({...props}) =>{
	const [boxOnOff, setBoxOnOff] = useState(false)
	return <Styled.CCBtnStyled
			tabIndex={0}
			onClick={()=>{
				setBoxOnOff(!boxOnOff)
			}}
			onBlur={()=>{
				setBoxOnOff(false)
			}}>
		<Styled.CCBtnIconStyled/>
		<ControlBox
			isAuthor={props.user && props.user.userNum===props.author_num}
			boxOnOff={boxOnOff}
			distance={props.getDistance()}
			deleteHandler={props.deleteHandler}
			updateHandler={props.updateHandler}
			/>
	</Styled.CCBtnStyled>
}

const ControlBox = ({...props}) =>{
	if(props.isAuthor && props.boxOnOff){
		if(props.distance<50) return <Styled.CCBoxOnLeftStyled>
			<Styled.CCStyled
				onClick={props.deleteHandler()}>
					삭제
			</Styled.CCStyled>
			<Styled.CCStyled
				onClick={props.updateHandler()}
				isBottom={true}>수정</Styled.CCStyled>
			</Styled.CCBoxOnLeftStyled>
		return <Styled.CCBoxOnRightStyled>
		<Styled.CCStyled
				onClick={props.deleteHandler()}>
					삭제
			</Styled.CCStyled>
			<Styled.CCStyled
				onClick={props.updateHandler()}
				isBottom={true}>수정</Styled.CCStyled>
		</Styled.CCBoxOnRightStyled>
	}
	return null
}
export const RecommentBtn = ({recommentClick,
							getRecomment,
							cnt,
							authorName,
							onOff,
							id}) =>{

	const renderCommentIcon = () =>{
		if(onOff) return <Styled.RecommentOnIcon
					theme="comment_sm"/>
		return <Styled.RecommentOffIcon theme="comment_sm"/>
	}
	const clickHandler = ()=>(e) =>{
		if(getRecomment) getRecomment()
		recommentClick(id,authorName)
	}

	return <Styled.RecommentBtnStyled onClick={clickHandler()}>
		{renderCommentIcon()}
		<Styled.NumberStyled>{convertUnitOfNum(cnt)}</Styled.NumberStyled>
		</Styled.RecommentBtnStyled>
}
export default withRouter(authWrapper(Comment));