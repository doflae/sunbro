import React, {Component} from "react";
import CommentBox from "./CommentBox";
import {sanitizeWrapper} from "../sanitize/sanitizeWrapper"
import userImg from "../static/img/user_default.png";

class Thumbnail extends Component{
    componentDidMount(){
        var b = new Set();
        var c = new Set();
        this.setState({
            commentboxOn:b,
            detailOn:c,
            detailOnContent:[],
        })
    }

    getDetail = (c) => (e) =>{
        e.preventDefault();
        const {detailOn, detailOnContent} = this.state;
        if(this.state.detailOn.has(c.id)){
            detailOn.delete(c.id)
        }else{
            detailOn.add(c.id)
        }
        this.setState({
            detailOn:detailOn,
        })
        if(c.content===undefined){
            this.props.request("get",`/board/detail/${c.id}`).then(res=>{
                c.content = this.props.sanitizeNonNull(res.data.data)
                detailOnContent[c.id] = c.content
                this.setState({
                    detailOnContent:detailOnContent
                })
            })
        }
    }

    getCommentBox = (cid) => (e) =>{
        const {commentboxOn} = this.state;
        if(this.state.commentboxOn.has(cid)){
            commentboxOn.delete(cid)
        }
        else{
            commentboxOn.add(cid)
        }
        this.setState({
            commentboxOn:commentboxOn,
        })
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
                            <img className="author_img" alt="" src={userImg}/>
                        )
                        :(
                            <img className="author_img" alt="" src={c.author.img}/>
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
                {this.state.detailOn.has(c.id)?(
                    <div className="board_detail" dangerouslySetInnerHTML={{__html:this.state.detailOnContent[c.id]}}></div>
                ):(<div className="board_thumbnail">
                        <img className="board_thumbnail_img" alt="" src={c.thumbnailImg}/>
                        <div className="board_thumbnail_text" dangerouslySetInnerHTML={{__html:this.props.sanitizeNonNull(c.thumbnail)}}></div>
                    </div>
                )}
                <div className="board_bottom">
                    <button className="see_detail" onClick={this.getDetail(c)}>
                        {this.state.detailOn.has(c.id)?("접기"):("펼치기")}</button>
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