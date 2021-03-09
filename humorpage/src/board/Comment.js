import React, {Component} from "react";
import userDefaultImg from "../static/img/user_32x.png";
import {faHeart as rHeart} from "@fortawesome/free-regular-svg-icons"
import {faHeart as sHeart} from "@fortawesome/free-solid-svg-icons"
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome"
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter, Link} from "react-router-dom"
import CommentUploader from "./CommentUploader"
import Dropzone from "react-dropzone"
import ReComment from "./ReComment"
import {sanitizeHarder, 
		getTime, 
		convertUnitOfNum, 
		getToday, 
		getRandomGenerator,
		isEmpty} from "../utils/Utils"
import Axios from "axios";
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

	recommentClick = (cid) => (e) => {
		e.preventDefault();
		const {commentUploaderOn} = this.state
		if (commentUploaderOn===cid){
			this.setState({
				commentUploaderOn:null,
			})
		}else{
			this.setState({
				commentUploaderOn:cid
			})
		}
	}

    appendComment = (cid,comment) =>{
        const {recommentList, keyList} = this.state
		if(recommentList[cid]===undefined) recommentList[cid]=[]
		recommentList[cid]=recommentList[cid].concat(comment)
		keyList.add(comment.id);
        this.setState({
            recommentList:recommentList,
			keyList:keyList,
			commentUploaderOn:null
        })
    }
	//대댓글용
    submitComment = (board_id, comment_id, cname) => async (e) =>{
        let tmp = e.target;
        let data = new FormData();
        let media = tmp.parentElement.previousElementSibling.firstElementChild.getAttribute('src');
        let content = tmp.parentElement.previousElementSibling.previousElementSibling.value
        if (!isEmpty(content)){
            content = `<span class="recomment_target">@${cname}</span>${content}`
        }
        if(!isEmpty(media)){
            await fetch(media).then(r=> r.blob()
            ).then(
                blob=>{
                    const filePath = "/"+getToday()+"/"+getRandomGenerator(10)+'.'+blob.type.split("/")[1];
                    data.append('media',filePath)
                    this.saveFile(blob,filePath);
                }
            )
        }
        if(!isEmpty(content)){
            let data = new FormData();
            data.append('content',content)
            data.append('board_id',board_id)
			data.append("comment_id",comment_id)
            return this.props.request('post',"/comment/upload",data).then(res =>{
                if(res.status===200 && res.data.success){
					tmp.parentElement.previousElementSibling.firstElementChild.setAttribute('src',"");
					tmp.parentElement.previousElementSibling.lastElementChild.style.zIndex="-1";
					tmp.parentElement.previousElementSibling.previousElementSibling.value="";
					const comment = res.data.data
                    comment.media = media // replace to blob data
                    this.appendComment(comment_id,comment)
                }else{
					this.props.history.push("/login")
                }
            })
        }else{
            alert("내용을 입력해주세요.")
        }
    }

    imageHandler = () => (e) =>{
        let target = e.target;
        while(target.className!=="comment_bottom"){
            target = target.parentElement
        }
        this.setState({
            target:target.previousElementSibling,
        })
        if (this.dropzone) this.dropzone.open();
    }

    onDrop = async(acceptFile) =>{
        var reader = new FileReader();
        reader.onload = (e) =>{
            const dataURL = e.target.result;
            var byteString = atob(dataURL.split(',')[1]);

            var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]

            var ab = new ArrayBuffer(byteString.length);
            var ia = new Uint8Array(ab);
            for (var i = 0; i < byteString.length; i++) {
              ia[i] = byteString.charCodeAt(i);
            }

            var blob = new Blob([ab], {type: mimeString});
            const{target}=this.state
            target.firstElementChild.src=URL.createObjectURL(blob);
            target.lastElementChild.style.zIndex=0;
        }
        if(acceptFile[0]) reader.readAsDataURL(acceptFile[0]);
    }

    saveFile = (file,path) => {
        const formData = new FormData();
        formData.append('file',file);
        formData.append('path',path);
        formData.append('needConvert',false)
		formData.append('mediaType',"COMMENT")
        Axios.post("/file/upload",formData,{
          headers:{
            'Content-Type':'multipart/form-data',
          }
        })
    };

    imageDelete = () => (e) => {
        let target = e.target;
		target.style.zIndex=-1;
		target.previousElementSibling.removeAttribute('src');
    }

	like = (target) => (e) => {
		let btn = e.target
		while(btn.className!=="comment-like"){
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
		if (recommentList[cid]===undefined){
			recommentList[cid]=[]
		}
		let resturl = `/comment/list?parent_id=${cid}`
		if(recommentLastid[cid]!==undefined){
			resturl += `&comment_id=${recommentLastid[cid]}`
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
		if(this.props.commentList===null || this.props.commentList.length === 0){
			return <span>첫 댓글을 달아주세요</span>
		}
		return this.props.commentList.map( c =>
			<div className="comment" key={c.id}>
				<img className="comment-userimg" srcSet={"/72"+c.author.userImg+" 72w"} alt="" src={c.author.userImg} onError={(e)=>{
					e.preventDefault(); e.target.onError=null;e.target.src=userDefaultImg; e.target.removeAttribute("srcset");
				}}/>
				
				<div className="comment-main">
					<div className="comment-subscript">
						<div className="comment-left">
							<div className="comment-author">
								<Link to={`/userpage/${c.author.usernum}`}>{c.author.name}</Link>
							</div>
							<div className="comment-others">
								{getTime(c.created)}
							</div>
						</div>
						<div className="comment-right">
							<button className="comment-like" onClick={this.like(c)}>
								좋아요 <span>{convertUnitOfNum(c.likes)}</span>{c.like || this.state.likeList.has(c.id)?(<FontAwesomeIcon icon={sHeart} color="red" size="lg"/>)
								:(<FontAwesomeIcon icon={rHeart} color="red" size="lg"/>)} 
							</button>
							<button className="re-comment" onClick={this.recommentClick(c.id)}>
								{this.state.commentUploaderOn===c.id?("답글 접기"):("답글 달기")}
							</button>
						</div>
					</div>
					<div className="comment-context">
						{isEmpty(c.content)?null:<p dangerouslySetInnerHTML={{__html:sanitizeHarder(c.content)}}></p>}
						{isEmpty(c.media)?null:<img srcSet={"/120x120"+c.media+" 120w"}
						src={c.media} alt="" className="comment_context_img" max-height="120px" max-width="120px"/>}
					</div>
			{c.children_cnt>0 && (this.state.recommentList[c.id]===undefined || c.children_cnt>this.state.recommentList[c.id].length)?
			(<button onClick={this.seeRecommment(c.id)}> 답글 {convertUnitOfNum(c.children_cnt)}</button>):null}
				

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
            {this.state.commentUploaderOn === c.id?(<CommentUploader imageHandler={this.imageHandler} imageDelete={this.imageDelete}
            submitComment={this.submitComment} board_id={this.props.board_id} comment_id={c.id} cname={c.author.name}/>):null}
					<Dropzone
                    ref = {(el)=>(this.dropzone = el)}
                    accept = "image/*"
                    onDrop = {this.onDrop}
					multiple = {false}
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

export default withRouter(authWrapper(Comment));