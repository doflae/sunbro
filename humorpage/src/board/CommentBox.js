import React, {Component} from 'react';
import Comment from './Comment'
import Dropzone from "react-dropzone"
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import CommentUploader from "./CommentUploader"
import {getToday, getRandomGenerator,isEmpty} from "../utils/Utils"
import Axios from "axios";
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
        this.getData();
    }

    appendComment = (comment) =>{
        const {commentList,keyList} = this.state
        keyList.add(comment.id)
        this.setState({
            commentList:commentList.concat(comment),
            keyList:keyList
        })
    }

    submitComment = (board_id) => async (e) =>{
        let tmp = e.target;
        let data = new FormData();
        let media = tmp.parentElement.previousElementSibling.firstElementChild.getAttribute('src');
        let content = tmp.parentElement.previousElementSibling.previousElementSibling.value
        if(!isEmpty(media)){
            await fetch(media).then(r=>r.blob()).then(
                blob=>{
                    const filePath = "/"+getToday()+"/"+getRandomGenerator(10)+'.'+blob.type.split("/")[1];
                    data.append('media',filePath)
                    this.saveFile(blob,filePath,false);
                }
            )
        }
        if(!isEmpty(content)||!isEmpty(media)){
            data.append('content',content)
            data.append('board_id',board_id)
            return this.props.request('post',"/comment/upload",data).then(res =>{
                if(res.status===200 && res.data.success){
                    tmp.parentElement.previousElementSibling.firstElementChild.setAttribute('src',"");
                    tmp.parentElement.previousElementSibling.lastElementChild.style.zIndex="-1";
                    tmp.parentElement.previousElementSibling.previousElementSibling.value="";
                    const comment = res.data.data
                    comment.media = media // replace to blob data
                    this.appendComment(comment)
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

    onDrop = (acceptFile) =>{
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

    saveFile = (file,path,needConvert) => {
        const formData = new FormData();
        formData.append('file',file);
        formData.append('path',path);
        formData.append('needConvert',needConvert)
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
    }
}
export default authWrapper(withRouter(CommentBox));
