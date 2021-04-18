import React, { useState } from "react"
import userDefaultImg from "../static/img/userDefault.png";
import {Link} from 'react-router-dom'
import {getTime} from "../utils/Utils"
import {authWrapper} from "../auth/AuthWrapper"
import {CommentLikeBtn, 
	CommentContext, 
	RecommentBtn,
	DeleteCommentBtn} from "./Comment"
import Axios from "axios";
import * as Styled from "./CommentStyled"

const RecommentConnector = ({...props}) => {
	if(props.onOff===false) return null;
	return <React.Fragment>
		{props.recommentList.map(c => <Recomment recommentOnId={props.recommentOnId}
						on={c.like} c={c} key={c.id}
		recommentClickHandler={props.recommentClickHandler}/>)}
		<SeeMoreBtn hasMore={props.onOffSeeMore} getData = {props.getData}/>
		</React.Fragment>
}

const SeeMoreBtn = ({hasMore, getData}) =>{
	if(hasMore===false) return null;
	else return <button onClick={e=>{e.preventDefault();getData();}}>더보기</button>
}

const Recomment = authWrapper(({c,recommentClickHandler,recommentOnId, ...props}) =>{
	const [isDeleted, setIsDeleted] = useState(false)
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
	if(c==null) return null;
	if(isDeleted) return null;
	return <Styled.RecommentStyled>
			<Styled.CommentUserImageStyled className="comment-userimg" src={"/api/file/get?name=/72"+c.author.userImg} alt="" onError={(e)=>{
					e.preventDefault(); e.target.onerror=null;e.target.src=userDefaultImg;
				}}/>
			
			<Styled.CommentMainStyled>
					<Styled.CommentSubsciprtStyled>
						<Styled.CommentLeftStyled>
							<Styled.CommentAuthorStyled>
								<Link to={`/userpage/${c.author.usernum}`}>{c.author.name}</Link>
								</Styled.CommentAuthorStyled>
							<div>
								{getTime(c.created)}
							</div>
						</Styled.CommentLeftStyled>
						<Styled.CommentRightStlyed>
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
						</Styled.CommentRightStlyed>
					</Styled.CommentSubsciprtStyled>
					<CommentContext 
						content={c.content} 
						media={c.media}
						blob={c.blob}/>
			</Styled.CommentMainStyled>
	</Styled.RecommentStyled>
})


export default RecommentConnector;