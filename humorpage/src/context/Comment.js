import React, {Component} from "react";
import userImg from "../static/img/user_default.png";
import {sanitizeWrapper} from "../sanitize/sanitizeWrapper"
import {faHeart as rHeart} from "@fortawesome/free-regular-svg-icons"
import {faHeart as sHeart} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter} from "react-router-dom"
import CommentUploader from "./CommentUploader"
import Dropzone from "react-dropzone"
import ReComment from "./ReComment"
class Comment extends Component{
	constructor(props){
		super(props);
        this.imageHandler = this.imageHandler.bind(this)
        this.imageDelete = this.imageDelete.bind(this)
        this.submitComment = this.submitComment.bind(this)
		this.recommentClick = this.recommentClick.bind(this)
		this.state = {
			recommentList : [],
			recommentLastid :[],
			keyList:new Set(),
			likeList:new Set(),
			commentUploaderOn:null,
		}
	}
	isEmpty = (st) => {
        return (st.length === 0 || !st.trim());
    }

	recommentClick = (cid) => (e) => {
		e.preventDefault();
		const {commentUploaderOn} = this.state
		if (commentUploaderOn==cid){
			this.setState({
				commentUploaderOn:null,
			})
		}else{
			this.setState({
				commentUploaderOn:cid
			})
		}
	}

    makeComment = (id, content, cid) =>{
        const {recommentList} = this.state
        const comment = [{
            id:id,
            like:false,
			created:null,
            updated:null,
            likes:0,
            content:content,
            author:this.props.user
        }]
		if(recommentList[cid]===undefined) recommentList[cid]=[]
		recommentList[cid]=recommentList[cid].concat(...comment)
        console.log(comment)
        this.setState({
            recommentList:recommentList,
        })
    }
	//대댓글용
    submitComment = (board_id, comment_id, cname) => (e) =>{
        let tmp = e.target;
        let image_src = tmp.parentElement.previousElementSibling.firstElementChild.getAttribute('src');
        let content = tmp.parentElement.previousElementSibling.previousElementSibling.value
        if (!this.isEmpty(content)){
            content = `<p><span class="recomment_target">${cname}</span>${content}</p>`
        }
        if(!this.isEmpty(image_src)){
            content+=`<img src="${image_src}" class="comment_context_img" height="100px" width="auto"/>`;
        }
        if(!this.isEmpty(content)){
            let data = new FormData();
            const {keyList} = this.state
            data.append('content',content)
            data.append('board_id',board_id)
			data.append("comment_id",comment_id)
			console.log(board_id,comment_id)
            return this.props.request('post',"/comment/upload",data).then(res =>{
                if(res.status==200 && res.data.success){
					this.makeComment(res.data.data, content, comment_id)
                    keyList.add(res.data.data);
					tmp.parentElement.previousElementSibling.firstElementChild.setAttribute('src',"");
					tmp.parentElement.previousElementSibling.lastElementChild.style.zIndex="-1";
					tmp.parentElement.previousElementSibling.previousElementSibling.value="";
                    this.setState({
                        keyList:keyList,
						commentUploaderOn:null,
                    })
                }else{
					this.props.history.push("/login")
                }
            })
        }else{
            alert("내용을 입력해주세요.")
        }
    }

    imageHandler = () => (e) =>{
        let target = e.target.parentElement.previousElementSibling;
        this.setState({
            target:target,
        })
        if (this.dropzone) this.dropzone.open();
        else console.log("test")
    }

    onDrop = async(acceptFile) =>{
        try{
            await acceptFile.reduce((pacc, _file) =>{
                if(_file.type.split("/")[0] ==="image"){
                    return pacc.then(async()=>{
                        await this.savefile(_file).then((res)=>{
                            let target = this.state.target
                            target.firstElementChild.src=res.data;
                            target.lastElementChild.style.zIndex=0;
                        });
                    });
                }
            }, Promise.resolve());
        } catch(error){}
    }

    savefile = (file) =>{
        const formData = new FormData();
        formData.append('file',file)
        if (this.state.target.firstElementChild.src){
            formData.append('src',this.state.target.firstElementChild.getAttribute("src"))
        }
        const nowDate = new Date().getTime();
        const workings = {...this.state.workings, [nowDate]:true};
        this.setState({workings});
        return this.props.request("post","/file/upload",formData,{
            headers:{
            'Content-Type':'multipart/form-data'
            }
        }).then(
            (res)=>{
                console.log(res)
            //반환 데이터에는 public/images 이후의 경로를 반환
            return res.data
            },
            (error)=>{
            console.error("saveFile error:", error);
            workings[nowDate] = false;
            this.setState({workings});
            return Promise.reject(error);
            }
        );
    }
    imageDelete = () => (e) => {
        let target = e.target;
        this.props.request("get", `/file/comment/delete?src=${target.previousElementSibling.getAttribute("src")}`)
        .then(res=>{
            if (res.data.success){
                target.style.zIndex=-1;
                target.previousElementSibling.src = "";
            }
        })
    }

	like = (target) => (e) => {
		let btn = e.target
		while(btn.className!="comment-like"){
			btn = btn.parentElement
		}
		const {likeList} = this.state;
		if(target.like===true){
			this.props.request("get",`/comment/likeoff?id=${target.id}`).then(res=>{
				if(!res.data.success){
					this.props.history.push("/login")
				}
			})
			target.like = false
			btn.firstElementChild.innerText = target.likes-1
			target.likes-=1
			likeList.delete(target.id)
		}else{
			this.props.request("get",`/comment/likeon?id=${target.id}`).then(res=>{
				if(!res.data.success){
					this.props.history.push("/login")
				}
			})
			target.like = true
			btn.firstElementChild.innerText = target.likes+1
			target.likes+=1
			likeList.add(target.id)
		}
		this.setState({
			likeList:likeList
		})
	}

	seeRecommment = (cid) => (e) =>{
		e.preventDefault();
		const {recommentList, recommentLastid} = this.state
		if (recommentList[cid]==undefined){
			recommentList[cid]=[]
		}
		let resturl = `/comment/list?parent_id=${cid}`
		if(recommentLastid[cid]!==undefined){
			resturl += `&${recommentLastid[cid]}`
		}
		this.props.request("get",resturl).then(res=>{
			recommentList[cid]=recommentList[cid].concat(...res.data.list)
			recommentLastid[cid] = res.data.list[res.data.list.length-1]['id']
			this.setState({
				recommentList:recommentList,
				recommentLastid:recommentLastid
			})
		})
	}

	render(){
		if(this.props.commentList==null || this.props.commentList.length === 0){
			return <span>첫 댓글을 달아주세요</span>
		}
		return this.props.commentList.map( c =>
			<div className="comment" key={c.id}>
				{c.author.img==null?(
					<img className="comment-userimg" src={userImg}/>
				):(
				<img className="comment-userimg" src={c.author.img} />
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
							<a className="comment-like" onClick={this.like(c)}>
								좋아요 <span>{c.likes}</span>{c.like || this.state.likeList.has(c.id)?(<FontAwesomeIcon icon={sHeart} color="red" size="lg"/>)
								:(<FontAwesomeIcon icon={rHeart} color="red" size="lg"/>)} 
							</a>
							<a className="re-comment" onClick={this.recommentClick(c.id)}>
								{this.state.commentUploaderOn==c.id?("답글 접기"):("답글 달기")}
							</a>
						</div>
					</div>
					<div className="comment-context" dangerouslySetInnerHTML={{__html:this.props.sanitizeHarder(c.content)}}>
					</div>
			{c.children_cnt>0 && (this.state.recommentList[c.id]===undefined || c.children_cnt>this.state.recommentList[c.id].length)?
			(<button onClick={this.seeRecommment(c.id)}> 답글 {c.children_cnt} 개</button>):null}
				

			{/* 대댓글 다는 박스를 답글위에 위치할건지
			답글아래에 위치할건지 위 아래 위치만 바꾸면됨 */}
			{this.state.recommentList[c.id]!==undefined?(
				<ReComment recommentList ={this.state.recommentList[c.id]} id={c.id} recommentClick={this.recommentClick}
				commentUploaderOn={this.state.commentUploaderOn} imageHandler={this.imageHandler} 
				imageDelete={this.imageDelete} submitComment={this.submitComment} board_id={this.props.board_id}/>
			):null}
			{this.state.recommentList[c.id]!==undefined&&c.children_cnt>this.state.recommentList[c.id].length?(
				<div><button onClick={this.seeRecommment(c.id)}>더보기</button></div>
			):null}
            {this.state.commentUploaderOn == c.id?(<CommentUploader imageHandler={this.imageHandler} imageDelete={this.imageDelete}
            submitComment={this.submitComment} board_id={this.props.board_id} comment_id={c.id} cname={c.author.uid}/>):null}
					<Dropzone
                    ref = {(el)=>(this.dropzone = el)}
                    accept = "image/*"
                    onDrop = {this.onDrop}
                    styles={{dropzone:{width:0,height:0}}}
                	>
                    {({getRootProps, getInputProps}) =>(
                    <section>
                        <div {...getRootProps()}>
                        <input {...getInputProps()}/>
                        </div>
                    </section>
                    )}
                	</Dropzone>
			</div>
        </div>
		
		)
	}
}

export default withRouter(authWrapper(sanitizeWrapper(Comment)));