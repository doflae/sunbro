import React, {Component} from "react";
import userImg from "../static/img/user_default.png";

export class Comment extends Component{
	constructor(props){
		super(props);
		this.recommentClick = this.recommentClick.bind(this)
	}
	recommentClick = (id) => (e) => {
		console.log(id);
		var t = e.target.parentElement.parentElement.parentElement;
		if(t.childElementCount === 3){
			t.removeChild(t.lastElementChild)
		}else{
			var node = document.createElement("div")
			node.className = "comment-input"
			var txt_area = document.createElement("textarea")
			var btn = document.createElement("button")
			btn.className="comment-btn"
			btn.type = "submit"
			btn.innerText = "등록"
			node.appendChild(txt_area)
			node.appendChild(btn)
			t.appendChild(node)
		}
	}
	render(){
		if(this.props.commentList==null || this.props.commentList.length === 0){
			return <h3>첫 댓글을 달아주세요</h3>
		}
		return this.props.commentList.map( c =>
			<div className="comment" key={c.id}>
				{c.author.img==null?(
					<img className="comment-userimg" src={userImg}/>
				):(
				<img className="comment-userimg" src={c.author.img} />
				)}
				
				<div className="comment-main">
					<p className="comment-subscript">
						<p className="comment-left">
							<p className="comment-author">
								{c.author.uid}
							</p>
							<p className="comment-others">
								{c.created}
							</p>
						</p>
						<p className="comment-right">
							<a className="re-comment" onClick={this.recommentClick(`${c.id}`)}>
								답글
							</a>
						</p>
					</p>
					<p className="comment-context">
						{c.content}
					</p>
				</div>
			</div>
		)
	}
}