import React, {Component} from "react"
import userImg from "../static/img/user_default.png";
import {sanitizeWrapper} from "../sanitize/sanitizeWrapper"
import {faHeart as rHeart} from "@fortawesome/free-regular-svg-icons"
import {faHeart as sHeart} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {withRouter} from 'react-router-dom'
import {authWrapper} from "../auth/AuthWrapper"
import CommentUploader from "./CommentUploader"
class ReComment extends Component{
    constructor(props){
        super(props);
		this.state= {
			likeOn:new Set(),
		}
    }
    like = (target) => (e) =>{
		let btn = e.target
		while(btn.className!=="comment-like"){
			btn = btn.parentElement
		}
		const {likeOn} = this.state
        if(target.like===true){
			this.props.request("get",`/comment/likeoff?id=${target.id}`).then(res=>{
				if(!res.data.success){
					this.props.history.push("/login")
				}
			})
			target.like = false
			btn.firstElementChild.innerText = target.likes-1
			target.likes-=1
			likeOn.add(target.id)
		}else{
			this.props.request("get",`/comment/likeon?id=${target.id}`).then(res=>{
				if(!res.data.success){
					this.props.history.push("/login")
				}
			})
			target.like = true
			btn.firstElementChild.innerText = target.likes+1
			target.likes+=1
			likeOn.delete(target.id)
		}
		this.setState({
			likeOn:likeOn,
		})
    }
    render(){
        return this.props.recommentList.map(c =>
            <div className="recomment" key={c.id}>
                {c.author.img===null?(
					<img className="comment-userimg" alt="" src={userImg}/>
				):(
				<img className="comment-userimg" alt="" src={c.author.img} />
				)}
				
				<div className="comment-main">
					<div className="comment-subscript">
						<div className="comment-left">
							<div className="comment-author">
								{c.author.uid}
							</div>
							<div className="comment-others">
								{c.created}
							</div>
						</div>
						<div className="comment-right">
							<button className="comment-like" onClick={this.like(c)}>
								좋아요 <span>{c.likes}</span>{c.like || this.state.likeOn.has(c.id)?(<FontAwesomeIcon icon={sHeart} color="red" size="lg"/>)
								:(<FontAwesomeIcon icon={rHeart} color="red" size="lg"/>)} 
							</button>
							<button className="re-comment" onClick={this.props.recommentClick(c.id)}>
								{this.props.commentUploaderOn===c.id?("답글 접기"):("답글 달기")}
							</button>
						</div>
					</div>
					<div className="comment-context" dangerouslySetInnerHTML={{__html:this.props.sanitizeHarder(c.content)}}>
					</div>
					{this.props.commentUploaderOn === c.id?(<CommentUploader imageHandler={this.props.imageHandler} imageDelete={this.props.imageDelete}
            submitComment={this.props.submitComment} board_id={this.props.board_id} comment_id={this.props.id} cname={c.author.uid}/>):null}
            
				</div>
            </div>
            )
    }
}

export default withRouter(authWrapper(sanitizeWrapper(ReComment)));