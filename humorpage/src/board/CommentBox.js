import React, {Component} from 'react';
import Comment from './Comment'
import Dropzone from "react-dropzone"
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import CommentUploader from "./CommentUploader"

class CommentBox extends Component{
    constructor(props){
        super(props)

        this.state = {
            commentList : [],
            last_id : null,
            keyList : new Set(),
            comment_cnt: this.props.comment_cnt
        };
        this.imageHandler = this.imageHandler.bind(this)
        this.imageDelete = this.imageDelete.bind(this)
        this.submitComment = this.submitComment.bind(this)
    }
    componentDidMount(){
        this.getData();
	}
	getData = () => {
        const {commentList, last_id, keyList} = this.state
		const id = this.props.board_id
        var resturl = `/comment/list?board_id=${id}`
        if (last_id){
            resturl+=`&comment_id=${last_id}`
        }
        this.props.request("get",resturl).then(res=>{
            let temp = [];
            let last_id = 0;
            res.data.list.forEach(function(comment){
                if (!keyList.has(comment.id)){
                    keyList.add(comment.id)
                    temp.push(comment)
                }
                last_id = comment.id;
            })
            if(last_id===null){
                this.setState({
                    commentList:commentList.concat([...temp]),
                    last_id:0,
                    keyList:keyList,
                })
            }else{
                this.setState({
                    commentList:commentList.concat([...temp]),
                    last_id:last_id,
                    keyList:keyList,
                })
            }
        })
    }

    seeMore = () => (e) =>{
        const {preItems, items} = this.state
        this.getData();
    }

    isEmpty = (st) => {
        return (st.length === 0 || !st.trim());
    }

    makeComment = (id, content) =>{
        const {commentList} = this.state
        const comment = [{
            id:id,
            like:false,
            updated:null,
            likes:0,
            content:content,
            author:this.props.user
        }]
        this.setState({
            commentList:commentList.concat([...comment]),
        })
    }

    submitComment = (board_id,comment_id) => (e) =>{
        let tmp = e.target;
        let image_src = tmp.parentElement.previousElementSibling.firstElementChild.getAttribute('src');
        let content = tmp.parentElement.previousElementSibling.previousElementSibling.value
        
        if (!this.isEmpty(content)){
            content = '<p>'+content+"</p>"
        }
        if(!this.isEmpty(image_src)){
            content+=`<img src="${image_src}" class="comment_context_img" height="100px" width="auto"/>`;
        }
        if(!this.isEmpty(content)){
            let data = new FormData();
            const {keyList} = this.state
            data.append('content',content)
            data.append('board_id',board_id)
            tmp.parentElement.previousElementSibling.firstElementChild.setAttribute('src',"");
            tmp.parentElement.previousElementSibling.lastElementChild.style.zIndex="-1";
            tmp.parentElement.previousElementSibling.previousElementSibling.value="";
            return this.props.request('post',"/comment/upload",data).then(res =>{
                if(res.status==200 && res.data.success){
                    keyList.add(res.data.data);
                    this.makeComment(res.data.data,content)
                    this.setState({
                        keyList:keyList,
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
    render(){
        const commentList = this.state.commentList
        const commentList_cnt = commentList.length
        const comment_cnt = this.state.comment_cnt
        return <div className="comment-box">
            <Comment commentList={commentList} board_id = {this.props.board_id}/>
            {
                comment_cnt>commentList_cnt
                ?<div><button onClick={this.seeMore()}>더보기</button></div>
                : null
            }
            <CommentUploader imageHandler={this.imageHandler} imageDelete={this.imageDelete}
            submitComment={this.submitComment} board_id={this.props.board_id} comment_id={0}/>
        
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
    }
}
export default authWrapper(withRouter(CommentBox));
