import React, {Component} from "react";
import CommentBox from "./CommentBox";
import {sanitizeWrapper} from "../sanitize/sanitizeWrapper"

class Thumbnail extends Component{
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
    like = (target) => (e) =>{
        let btn;
        if(e.target.lastElementChild){
            btn = e.target
        }else{
            btn = e.target.parentElement
        }
        if(target.like===true){
            this.props.request('get',`/board/likeoff?id=${target.id}`).then(res=>{
                if (!res.data.success){
                    this.props.history.push("/login")
                }
            })
            target.like = false
            btn.classList.toggle("like_on")
            btn.lastElementChild.innerText=target.likes-1
            target.likes-=1
        }else{
            this.props.request('get',`/board/likeon?id=${target.id}`).then(res=>{
                if (!res.data.success){
                    this.props.history.push("/login")
                }
            })
            target.like=true
            btn.classList.toggle("like_on")
            btn.lastElementChild.innerText=target.likes+1
            target.likes+=1
        }
    }
    render(){
        if(this.props.boards == null || this.props.boards.length ===0){
            return <h5 className="p-2">No boards</h5>
        }
        return this.props.boards.map(c =>
            <div className="board" key={c.id}>
                <div className="board_top">
                    <div className="board_top_left">
                        {c.author.img==null?(
                            <img className="author_img" src="/images/user_default.jpg"/>
                        )
                        :(
                            <img className="author_img" src={c.author.img}/>
                        )}
                    </div>
                    <div className="board_top_center">
                        <div className="author_name">{c.author.uid}</div>
                        <div className="created">3 시간전</div>
                    </div>
                    <div className="board_top_right"></div>
                </div>
                <div className="board_title">
                    {c.title}
                </div>
                <img className="board_thumbnail_img" src={c.thumbnailImg}/>
                <div className="board_thumbnail_text" dangerouslySetInnerHTML={{__html:this.props.sanitize(c.thumbnail)}}></div>
                <div className="board_bottom">
                    <button className="see_detail">펼치기</button>
                    <div className="buttons">
                        <button className="board_btn" onClick={this.getCommentBox(c.id)}><span>댓글</span><span>{c.total_comments_num}</span></button>
                        <button className={c.like?("like_btn board_btn like_on"):
                    ("like_btn board_btn like_off")}
                    onClick={this.like(c)}><span>좋아요</span><span>{c.likes}</span></button>
                        
                        <button className="scrap_btn board_btn">공유하기</button>    
                    </div>
                </div>
                {this.state.commentboxOn.has(c.id)?(
                    <CommentBox board_id={c.id} comment_cnt = {c.comments_num}/>
                ):(
                    <></>
                )}
            </div>
            )
    }
}

export default sanitizeWrapper(Thumbnail)