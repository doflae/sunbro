import React, {Component} from "react";
import CommentBox from "./CommentBox";
import userImg from "../static/img/user_default.png";
import {sanitizeNonNull, getTime, convertUnitOfNum} from "../utils/Utils"
class Thumbnail extends Component{
    componentDidMount(){
        var foot = document.querySelector(".footer")
        var godownbtn = document.createElement("p")
        godownbtn.className = "goNext"
        godownbtn.innerText = "다음글"
        godownbtn.addEventListener('click',this.gotoNext())
        foot.appendChild(godownbtn)
        var b = new Set();
        var c = new Set();
        this.setState({
            commentboxOn:b,
            detailOn:c,
            detailOnContent:[],
            lastElementid:0,
            erazeTarget:godownbtn
        })
    }

    componentWillUnmount(){
        document.querySelector(".footer").removeChild(this.state.erazeTarget)
    }

    getDetail = (c) => (e) =>{
        e.preventDefault();
        const {detailOn, detailOnContent} = this.state;
        let target = e.target
        if(this.state.detailOn.has(c.id)){
            detailOn.delete(c.id)
            //접기 -> 다음글로 scroll 이동해야힘
            this.setState({
                detailOn:detailOn,
            },()=>{
                //접은 다음 스크롤 높이 계산(동기화)
                let next = target.parentElement.parentElement.nextElementSibling
                window.scrollTo({top:next.offsetTop,behavior:'smooth'})
            })
        }else{
            detailOn.add(c.id)
            //펼치기 -> 현재글을 탑으로
            this.setState({
                detailOn:detailOn,
            })
            let now = target.parentElement.parentElement
            window.scrollTo({top:now.offsetTop,behavior:'smooth'})
        }
        if(c.content===undefined){
            this.props.request("get",`/board/detail/${c.id}`).then(res=>{
                c.content = sanitizeNonNull(res.data.data)
                detailOnContent[c.id] = c.content
                this.setState({
                    detailOnContent:detailOnContent
                })
            })
        }
    }
    gotoNext = () =>(e)=> {
        e.preventDefault();
        const {documentElement, body} = document;
        let {lastElementid} = this.state
        const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
        const scrollBottom = scrollTop+documentElement.clientHeight
        const boards = documentElement.querySelectorAll(".board")
        for(let i = lastElementid+1; i<boards.length;i++){
            const b = boards[i]
            const offsetTop = b.offsetTop
            if(offsetTop+b.offsetHeight<scrollBottom) continue
            this.setState({
                lastElementid:i,
            })
            window.scrollTo({top:offsetTop, behavior:'smooth'})
            break;
            
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
        return <div className="board_main">
            {this.props.boards.map(c =>{
            return <div className="board" key={c.id}>
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
                        <div className="created">{getTime(c.created)}</div>
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
                        <div className="board_thumbnail_text" dangerouslySetInnerHTML={{__html:sanitizeNonNull(c.thumbnail)}}></div>
                    </div>
                )}
                <div className="board_bottom">
                    <button className="see_detail" onClick={this.getDetail(c)}>
                        {this.state.detailOn.has(c.id)?("접기"):("펼치기")}</button>
                    <div className="buttons">
                        <button className="board_btn" onClick={this.getCommentBox(c.id)}><span>댓글</span><span>{convertUnitOfNum(c.total_comments_num)}</span></button>
                        <button className={c.like?("like_btn board_btn like_on"):
                    ("like_btn board_btn like_off")}
                    onClick={this.like(c)}><span>좋아요</span><span>{convertUnitOfNum(c.likes)}</span></button>
                        
                        <button className="scrap_btn board_btn">공유하기</button>    
                    </div>
                </div>
                {this.state.commentboxOn.has(c.id)?(
                    <CommentBox board_id={c.id} comment_cnt = {c.comments_num}/>
                ):(
                    <></>
                )}
            </div>
    
        })}
        </div>
    }
}

export default Thumbnail