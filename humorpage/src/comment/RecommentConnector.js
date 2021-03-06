import React, { useRef, useState } from "react"
import userDefaultImg from "../static/img/userDefault.png";
import {Link} from 'react-router-dom'
import {authWrapper} from "../auth/AuthWrapper"
import {CommentLikeBtn, 
	CommentContext, 
	RecommentBtn,
	ControlCommentBtn} from "./Comment"
import Axios from "axios";
import * as Styled from "./CommentStyled"
import CommentUploader from "./CommentUploader";

const RecommentConnector = ({...props}) => {
	if(props.onOff===false) return null;
	return <React.Fragment>
		{props.recommentList.map(c => <Recomment recommentOnId={props.recommentOnId}
						on={c.like} c={c} key={c.id}
						mediaDir={props.mediaDir}
		recommentClickHandler={props.recommentClickHandler}/>)}
		<SeeMoreBtn hasMore={props.onOffSeeMore} getData = {props.getData}/>
		</React.Fragment>
}

const SeeMoreBtn = ({hasMore, getData}) =>{
	if(hasMore===false) return null;
	else return <Styled.SeeMoreBtnStyled 
	onClick={e=>{e.preventDefault();getData();}}>더보기...
	</Styled.SeeMoreBtnStyled>
}

const Recomment = authWrapper(({recommentClickHandler,recommentOnId, ...props}) =>{
	const [c, setC] = useState(props.c)
	const [isDeleted, setIsDeleted] = useState(false)
	const [updateMode, setUpdateMode] = useState(false)
	const optionRef = useRef()
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

	const updateHandler = ()=>(e) =>{
		setUpdateMode(!updateMode)
	}

	const successHandler = (c)=>{
		setUpdateMode(!updateMode)
		setC(c)
	}

	if(c==null) return null;
	if(isDeleted) return null;
	if(updateMode) return <CommentUploader c={c}
							comment_id={c.parentId}
							board_id={c.boardId}
							mediaDir={props.mediaDir}
							success={successHandler}
							cancel={updateHandler}
							/>
	return <Styled.RecommentStyled>
			<Styled.CommentUserImageStyled className="comment-userimg" src={"/api/file/get?name=/72"+c.authorImg} alt="" onError={(e)=>{
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
						media={c.media}
						blob={c.blob}/>
			</Styled.CommentMainStyled>
			<Styled.CommentOptionStlyed ref = {optionRef}>
				<CommentLikeBtn comment_id={c.id} board_id={c.boardId} like={c.like} likes={c.likes}/>
				<RecommentBtn recommentClick={recommentClickHandler}
					authorName={c.authorName}
					id={c.id}
					onOff={recommentOnId===c.id}/>
			</Styled.CommentOptionStlyed>
	</Styled.RecommentStyled>
})


export default RecommentConnector;