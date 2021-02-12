import React, {Component, createElement} from "react";
import {Context} from "./Context";
import {CommentBox} from "./CommentBox";

export class Thumbnail extends Component{
    constructor(props){
        super(props)
    }
    componentDidMount(){
        let b = new Set();
        this.setState({
            commentboxOn:b
        })
    }
    getCommentBox = (cid) => (e) =>{
        if(this.state.commentboxOn.has(cid)){
            const cmt = this.state.commentboxOn;
            cmt.delete(cid) 
            this.setState({
                commentboxOn:cmt
            })
        }
        else{
            const cmt = this.state.commentboxOn;
            cmt.add(cid);
            this.setState({
                commentboxOn:cmt
            })
        }
    }
    render(){
        if(this.props.contexts == null || this.props.contexts.length ===0){
            return <h5 className="p-2">No Contents</h5>
        }
        return this.props.contexts.map(c =>
            <div className="content" key={c.id}>
                <div className="content_top">
                    <p className="content_top_left">
                        {c.author.img==null?(
                            <img className="author_img" src="/images/user_default.jpg"/>
                        )
                        :(
                            <img className="author_img" src={c.author.img}/>
                        )}
                    </p>
                    <p className="content_top_center">
                        <div className="author_name">{c.author.uid}</div>
                        <div className="created">3 시간전</div>
                    </p>
                    <p className="content_top_right"></p>
                </div>
                <div className="content_title">
                    {c.title}
                </div>
                <div className="context_thumbnail_text">썸네일 글</div>
                <div className="context_thumbnail_img" dangerouslySetInnerHTML={{__html:c.thumbnail}}></div>
                <div className="conext_bottom">
                    <button className="see_detail">펼치기</button>
                    <div className="buttons">
                        <button className="comment_btn content_btn" onClick={this.getCommentBox(c.id)}>댓글{c.comment_cnt}</button>
                        <button className="like_btn content_btn">좋아요{c.likes}</button>
                        <button className="scrap_btn content_btn">공유하기</button>    
                    </div>
                </div>
                {this.state.commentboxOn.has(c.id)?(
                    <CommentBox content_id={c.id}/>
                ):(
                    <></>
                )}
            </div>
            )
    }
}