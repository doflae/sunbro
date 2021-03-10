import React, {useState,useRef} from 'react';
import userDefaultImg from "../static/img/user_128x.png";
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter} from 'react-router-dom'
import {ReactComponent as Pencil} from '../static/svg/pencil.svg'
import Dropzone from "react-dropzone"
import Axios from "axios"
import styled from "styled-components"
import {getRandomGenerator} from "../utils/Utils"

const SubmitImageBtn = styled.button`
    width:80px;
    height:30px;
    font-size:0.8em;
    position:absolute;
`

function MyHeader({
    ...props
}){
    const user = props.userDetail;
    const [userImg, setUserImg] = useState(user.userImg);
    const [mediaFormat, setMediaFormat] = useState(null);
    const dropzoneRef = useRef()
    const profileImgRef = useRef()
    const imageHandler = () => (e) =>{
        e.preventDefault();
        if(dropzoneRef) dropzoneRef.current.open();
    }

    const imageDelete = ()=>(e) =>{
        setUserImg("");
    }
    const saveFile = (file,path) =>{
        const formData = new FormData();
        formData.append('file',file);
        formData.append('path',path);
        formData.append('needConvert',false)
        formData.append('mediaType',"PROFILE")
        Axios.post("/file/upload",formData,{
          headers:{
            'Content-Type':'multipart/form-data',
          }
        })
    }
    const onDrop = async(acceptFile) =>{
        var reader = new FileReader();
        setMediaFormat(acceptFile[0].type.split("/")[1]);
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
            setUserImg(URL.createObjectURL(blob))
            profileImgRef.current.style.margin = "10px"
        }
        if(acceptFile[0]) reader.readAsDataURL(acceptFile[0]);
       
    }
    const imageSubmit = () => (e) => {
        if(userImg.startsWith("blob")){
            const filePath = "/profileImg/"+getRandomGenerator(21)+'.'+mediaFormat;
            fetch(userImg).then(r=>r.blob()).then(async(blob)=>{
                await saveFile(blob,filePath)
                const formData = new FormData();
                formData.append('path',filePath)
                props.request("post","/account/update/img",formData).then(res=>{
                    if(res.status===200 && res.data.success){
                        user.userImg = filePath;
                        setUserImg(filePath)
                        profileImgRef.current.style.margin = "";
                    }
                })
            })
        }
    }
    if(user===null){
        return null;
    }
    return <div className="mypage_header">
        <div className="myprofile">
            <div className="myprofile_imgzone">
                <button className="profileimg_delete" onClick={imageDelete()}></button>
                <div ref={profileImgRef} onClick={imageHandler()}>
                    <img className="myprofile_img" src={userImg} alt=""  onError={(e)=>{e.target.onerror=null;e.target.src=userDefaultImg;}}/>
                    <Pencil width="20" height="20" className="myprofile_pencil"/>
                </div>
            </div>
            {userImg!==user.userImg?<SubmitImageBtn onClick={imageSubmit()}>변경 완료</SubmitImageBtn>:null}
        </div>
    <span className="mypage_user_detail">
        <div className="mypage_user_name">{user.name}
        </div>
        <div className="mypage_user_log">
            게시물 {user.total_board_num} 개  댓글 {user.total_comment_num} 개
        </div>    
    </span>

    <Dropzone
        ref = {dropzoneRef}
        accept = "image/*"
        onDrop = {onDrop}
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
export default withRouter(authWrapper(MyHeader));