import React from "react"
import userDefaultImg from "../static/img/user_32x.png";
import {Link} from 'react-router-dom'
import {getTime} from "../utils/Utils"
import {CommentLikeBtn, CommentContext, RecommentBtn, CommentUserImageStyled} from "./Comment"

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

const Recomment = ({c, recommentClickHandler,recommentOnId}) =>{
	if(c==null) return null;
	return <div className="recomment">
			<CommentUserImageStyled className="comment-userimg" src={"/api/file/get?name=/72"+c.author.userImg} alt="" onError={(e)=>{
					e.preventDefault(); e.target.onerror=null;e.target.src=userDefaultImg;
				}}/>
			
			<div className="comment-main">
				<div className="comment-subscript">
					<div className="comment-left">
						<div className="comment-author">
							<Link to={`/mypage/${c.author.usernum}`}>{c.author.name}</Link>
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
				<CommentContext content={c.content} media={c.media} blob={c.blob}/>
			</div>
		</div>
}
export default RecommentConnector;