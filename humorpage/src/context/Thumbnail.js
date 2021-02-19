import React, {Component} from "react";
import CommentBox from "./CommentBox";

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
            btn.style.backgroundColor="#e7e6e1"
            btn.lastElementChild.innerText=target.likes-1
            target.likes-=1
        }else{
            this.props.request('get',`/board/likeon?id=${target.id}`).then(res=>{
                if (!res.data.success){
                    this.props.history.push("/login")
                }
            })
            target.like=true
            btn.style.backgroundColor="#f875aa"
            btn.lastElementChild.innerText=target.likes+1
            target.likes+=1
        }
    }
    render(){
        if(this.props.contexts == null || this.props.contexts.length ===0){
            return <h5 className="p-2">No Contents</h5>
        }
        return this.props.contexts.map(c =>
            <div className="content" key={c.id}>
                <div className="content_top">
                    <div className="content_top_left">
                        {c.author.img==null?(
                            <img className="author_img" src="/images/user_default.jpg"/>
                        )
                        :(
                            <img className="author_img" src={c.author.img}/>
                        )}
                    </div>
                    <div className="content_top_center">
                        <div className="author_name">{c.author.uid}</div>
                        <div className="created">3 시간전</div>
                    </div>
                    <div className="content_top_right"></div>
                </div>
                <div className="content_title">
                    {c.title}
                </div>
                <div className="context_thumbnail_text" dangerouslySetInnerHTML={{__html:c.content}}></div>
                <div className="context_thumbnail_img" dangerouslySetInnerHTML={{__html:c.thumbnail}}></div>
                <div className="conext_bottom">
                    <button className="see_detail">펼치기</button>
                    <div className="buttons">
                        <button className="content_btn" onClick={this.getCommentBox(c.id)}><span>댓글</span><span>{c.comments_num}</span></button>
                        <button className="like_btn content_btn" onClick={this.like(c)}><span>좋아요</span><span>{c.likes}</span></button>
                        
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