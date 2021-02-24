import React,{Component} from "react";
import {CommentBox} from "./CommentBox";

export class Board extends Component{
	render(){
		//왜 이부분이 필요함?
		if (this.props.contexts == null || this.props.contexts.length === 0){
			return <h5 className="p-2">No Contexts</h5>
		}
		return this.props.contexts.map( c =>
		<div className="context" key={c.id}>
			<div className="content_top">
				<p className="author_img"></p>
				<p className="author_name"><h4>{c.author.uid}</h4></p>
			</div>
			<div className="title">
				<h2>{c.title}</h2>
			</div>
			<div className="subscript">
				<p className="sub author"> {c.author}</p>
				<p className="sub others"> 추천수 : {c.likes}</p>
				<p className="sub others"> 조회 : {c.join}</p>
				<p className="sub others"> {c.created}</p>
				<p className="sub others"> 댓글 {c.comment_cnt}</p>
			</div>
			<div className="context_main" dangerouslySetInnerHTML={{__html:c.content}}>
			</div>
			<div className="context_bottom">
				<div className="buttons">
					<button>댓글 {c.comment_cnt}</button>
					<button>추천해요 {c.likes}</button>
					<button className="scrap">공유하기</button>
				</div>
			</div>
			<CommentBox context_id={c.id} comment_cnt={c.comment_cnt}/>
		</div>
		)
	}
}
