import React, {useState,useRef, useEffect} from "react";
import userDefaultImg from "../static/img/userDefault.png";
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter, Link, useHistory} from "react-router-dom"
import {sanitizeHarder,
		convertUnitOfNum, 
		isEmpty,
		observeTrigger,
		debounce} from "../utils/Utils"
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

	const deleteHandler = () =>{
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

	const updateHandler = () =>{
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

	const getRecomment = () => {
		if(onOffrecomment) return
		getData().then(
			setOnOffrecomment(true)
		)
	}

	if(c==null) return null;
	if(isDeleted) return null;
	if(updateMode) return <CommentUploader c={c}
						board_id={c.boardId}
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
							optionRef={optionRef}
							deleteHandler={deleteHandler}
							updateHandler={updateHandler}
						/>
					</Styled.CommentSubsciprtStyled>
					<CommentContext 
						content={c.content} 
						media={c.media}/>
			</Styled.CommentMainStyled>
			<Styled.CommentOptionStlyed ref = {optionRef}>
				<CommentLikeBtn comment_id={c.id} board_id={c.boardId}
				like={c.like} likes={c.likes}/>
				<RecommentBtn recommentClick={recommentClickHandler}
					authorName={c.authorName}
					id={c.id}
					getRecomment = {getRecomment}
					onOff={recommentOnId===c.id}
					cnt={c.childrenCnt}/>
			</Styled.CommentOptionStlyed>
		</Styled.CommentStyled>
		<Styled.RecommentBox>
			<RecommentConnector id={c.id}
					comment_id={c.id}
					board_id={c.boardId}
					onOff={onOffrecomment}
					getData={getData}
					mediaDir = {c.mediaDir}
					recommentOnId={recommentOnId}
					recommentList={recommentList}
					recommentClickHandler={recommentClickHandler}
					onOffSeeMore={onOffSeeMore}/>
			<CommentUploader 
					onOff = {uploaderSetting.onOff}
					cname = {uploaderSetting.target}
					board_id={c.boardId}
					comment_id={c.id}
					mediaDir={c.mediaDir}
					failedMsg = {"삭제된 댓글입니다."}
					failedHandler={()=>{setIsDeleted(true)}}
					appendComment={appendComment}/>
		</Styled.RecommentBox>
	</React.Fragment>
}
export const CommentLikeBtn = ({comment_id,board_id,like,likes}) =>{

	const [likeCnt,setLikeCnt] = useState({
		like:like,
		cnt:likes
	})
	let history = useHistory();

	const likeHandler = () => {
		if(likeCnt.like){
			setLikeCnt({
				like:!likeCnt.like,
				cnt:likeCnt.cnt-1
			})
		}else{
			setLikeCnt({
				like:!likeCnt.like,
				cnt:likeCnt.cnt+1
			})
		}
		debounce(debounceLike)();
	}

	const debounceLike = () =>{
		const formData = new FormData();
		formData.append("id",comment_id)
		formData.append("boardId",board_id)
		formData.append("onOff",!likeCnt.like)
		Axios.post("/comment/like",formData).then(res=>{
			if(res.status===200 && !res.data.success){
				history.push("/login")
			}
		})
	}
	
	if(likeCnt.like){
		return <Styled.LikeStyled>
		<Styled.LikeBtnStyled
		theme="like_sm"
		onClick={likeHandler}/>
		<Styled.NumberStyled>
			{convertUnitOfNum(likeCnt.cnt)}
		</Styled.NumberStyled>
	</Styled.LikeStyled>
	}
	return <Styled.LikeStyled>
		<Styled.LikeBtnStyled
		color="invert(34%) sepia(88%) saturate(862%) hue-rotate(329deg) brightness(98%) contrast(98%)"
		theme="like_sm"
		onClick={likeHandler}/>
		<Styled.NumberStyled>
			{convertUnitOfNum(likeCnt.cnt)}
		</Styled.NumberStyled>
	</Styled.LikeStyled>
}

export const CommentContext = ({content,media}) =>{
	const contentChecked = isEmpty(content)?"":sanitizeHarder(content)
	const ContentRef = useRef()
	let onOff = false
	const renderContent = () =>{
		if(media){
			return contentChecked+media
		}
		return contentChecked
	}

	useEffect(()=>{
		if(media && ContentRef.current){
			const target = ContentRef.current.querySelector(".ng-img-div")
			observeTrigger(()=>{
				var img = new Image()
				img.src = target.dataset.sm
				target.appendChild(img)
				img.onload = () =>{
					target.firstChild.classList.add('loaded');
				}
				var imgLarge = new Image();
				imgLarge.src = target.dataset.lg
				imgLarge.onload = () =>{
					imgLarge.classList.add("loaded")
				}
				target.appendChild(imgLarge)
			},target)
			target.addEventListener("click",()=>{
				if(onOff){
					//large 상태
					target.style.width="100px"
				}else{
					//small 상태
					if(target.dataset.sm){
						//그대로 lg url 요청
						target.lastElementChild.src = target.dataset.lg
						target.dataset.sm = "";
					}
					//이미 lg img 요청했기에 사이즈만 변경
					target.style.width=`${target.dataset.width}px`
				}
				onOff=!onOff
			})
		}
	},[])

	return <Styled.CommentContextStyled ref={ContentRef}>
		<p dangerouslySetInnerHTML={{__html:renderContent()}}></p>
	</Styled.CommentContextStyled>
}

export const ControlCommentBtn = ({optionRef,...props}) =>{
	const [boxOnOff, setBoxOnOff] = useState(false)
	
	const getDistance = ()=>{
		if(optionRef.current){
			return parseInt(window.getComputedStyle(optionRef.current).marginLeft);
		}
		return 100;
	}

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
			distance={getDistance()}
			deleteHandler={props.deleteHandler}
			updateHandler={props.updateHandler}
			/>
	</Styled.CCBtnStyled>
}

const ControlBoxOptions = {
	left:{
		borderColor:"transparent transparent transparent #ccc",
		boxRight:"18px",
		arrowRight:"-14px"
	},
	right:{
		borderColor:"transparent #ccc transparent transparent",
		boxRight:"-51px",
		arrowRight:"50px"
	}
}
const ControlBox = ({...props}) =>{
	if(props.isAuthor && props.boxOnOff){
		const options = props.distance<50?
			ControlBoxOptions.left:
			ControlBoxOptions.right
		return <Styled.CCBoxStyled
			{...options}
		>
				<Styled.CCStyled
					onClick={props.deleteHandler}>
						삭제
				</Styled.CCStyled>
				<Styled.CCStyled
					onClick={props.updateHandler}
					isBottom={true}>
					수정
				</Styled.CCStyled>
			</Styled.CCBoxStyled>
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