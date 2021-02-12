import React, {Component} from 'react';
import {Comment} from './Comment'
import Dropzone from "react-dropzone"
import { uploadFile } from '../upload/UploadFile';
export class CommentBox extends Component{
    constructor(props){
        super(props)

        this.state = {
            commentList : [],
            items: 3,
            preItems: 0
        };
    }
    componentDidMount(){
        const {items} = this.state
        console.log(this.props)
		this.getData();
        this.setState({
            preItems:items,
            items:items+10,
        });
	}
	getData = () => {
        const {commentList, items, preItems} = this.state
		const id = this.props.content_id
        var resturl = `/comment/list?content_id=${id}`
		fetch(resturl)
		.then((res) => res.json())
		.then( data =>{
            console.log(data)
			this.setState({
				commentList:commentList.concat([...data])
			});
		});
    }

    seeMore = () => (e) =>{
        const {preItems, items} = this.state
        this.getData();
        this.setState({
            preItems:items,
            items:items+10,
        });
    }

    submitComment = () => (e) =>{
        console.log(e.target.previousElement.value);
    }

    imageHandler = () => (e) =>{
        this.setState({
            target:e.target.parentElement.previousElementSibling,
        })
        if (this.dropzone) this.dropzone.open();
    }

    onDrop = async(acceptFile) =>{
        console.log("hiwing")
        try{
            await acceptFile.reduce((pacc, _file, i) =>{
                if(_file.type.split("/")[0] ==="image"){
                    return pacc.then(async()=>{
                        await this.savefile(_file).then((res)=>{
                            let target = this.state.target
                            target.style.height="auto";
                            target.firstElementChild.src="/images/"+res.data;
                        });
                    });
                }
            }, Promise.resolve());
        } catch(error){}
    }

    savefile = (file) =>{
        const formData = new FormData();
        formData.append('file', file)
        const nowDate = new Date().getTime();
        const workings = {...this.state.workings, [nowDate]:true};
        this.setState({workings});
        return uploadFile(formData,{
            headers:{
              'Content-Type':'multipart/form-data'
            }
          }).then(
            (res)=>{
                console.log(res);
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
    render(){
        const commentList = this.state.commentList
        const more_items = this.state.preItems
        const comment_cnt = this.state.comment_cnt
        return <div className="comment-box">
            <Comment commentList={commentList}/>
            {
                comment_cnt>more_items
                ?<div><button onClick={this.seeMore()}>더보기</button></div>
                : null
            }
            <div className="comment-input">
                <textarea className="comment_textarea"></textarea>
                <div className="comment_preimgzone">
                <img className="comment_preimg" src="" height="100px" width="auto"></img>
                </div>
                <div className="comment_bottom">
                    <svg className="comment_img" onClick={this.imageHandler()} widht="30px" height="30px" viewBox="0 0 420.8 420.8">
                                <path d="M406.8,96.4c-8.4-8.8-20-14-33.2-14h-66.4v-0.8c0-10-4-19.6-10.8-26c-6.8-6.8-16-10.8-26-10.8h-120
                                    c-10.4,0-19.6,4-26.4,10.8c-6.8,6.8-10.8,16-10.8,26v0.8h-66c-13.2,0-24.8,5.2-33.2,14c-8.4,8.4-14,20.4-14,33.2v199.2
                                    C0,342,5.2,353.6,14,362c8.4,8.4,20.4,14,33.2,14h326.4c13.2,0,24.8-5.2,33.2-14c8.4-8.4,14-20.4,14-33.2V129.6
                                    C420.8,116.4,415.6,104.8,406.8,96.4z M400,328.8h-0.4c0,7.2-2.8,13.6-7.6,18.4s-11.2,7.6-18.4,7.6H47.2
                                    c-7.2,0-13.6-2.8-18.4-7.6c-4.8-4.8-7.6-11.2-7.6-18.4V129.6c0-7.2,2.8-13.6,7.6-18.4s11.2-7.6,18.4-7.6h77.2
                                    c6,0,10.8-4.8,10.8-10.8V81.2c0-4.4,1.6-8.4,4.4-11.2s6.8-4.4,11.2-4.4h119.6c4.4,0,8.4,1.6,11.2,4.4c2.8,2.8,4.4,6.8,4.4,11.2
                                    v11.6c0,6,4.8,10.8,10.8,10.8H374c7.2,0,13.6,2.8,18.4,7.6s7.6,11.2,7.6,18.4V328.8z"/>
                                <path d="M210.4,130.8c-27.2,0-52,11.2-69.6,28.8c-18,18-28.8,42.4-28.8,69.6s11.2,52,28.8,69.6c18,18,42.4,28.8,69.6,28.8
                                    s52-11.2,69.6-28.8c18-18,28.8-42.4,28.8-69.6s-11.2-52-28.8-69.6C262.4,142,237.6,130.8,210.4,130.8z M264.8,284
                                    c-14,13.6-33.2,22.4-54.4,22.4S170,297.6,156,284c-14-14-22.4-33.2-22.4-54.4c0-21.2,8.8-40.4,22.4-54.4
                                    c14-14,33.2-22.4,54.4-22.4s40.4,8.8,54.4,22.4c14,14,22.4,33.2,22.4,54.4C287.6,250.8,278.8,270,264.8,284z"/>
                                <circle cx="352.8" cy="150" r="19.6"/>
                    </svg>
                <button className="comment-btn" onClick={this.submitComment()} type="submit">등록</button>
                </div>
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
    }
}