import React, {useState,useRef} from 'react';
import userDefaultImg from "../static/img/user_128x.png";
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter} from 'react-router-dom'
import {ReactComponent as Pencil} from '../static/svg/pencil.svg'
import Dropzone from "react-dropzone"
import Axios from "axios"
import styled from "styled-components"
import {getRandomGenerator, ResizeImage} from "../utils/Utils"

const SubmitImageBtnStyled = styled.button`
    width:80px;
    height:30px;
    font-size:0.8em;
    position:absolute;
`

const SubmitImageBtn = ({isChanged, onClick}) => {
    if(isChanged) return <SubmitImageBtnStyled onClick={onClick()}>변경 완료</SubmitImageBtnStyled>
    else return null;
}

function MyHeader({
    ...props
}){
    const user = props.userDetail;
    const [userImg, setUserImg] = useState(user.userImg);
    const [userImgResized, setUserImgResized] = useState({})
    const [mediaFormat, setMediaFormat] = useState(null);
    const [isChanged, setIsChanged] = useState(false);
    const dropzoneRef = useRef()
    const profileImgRef = useRef()
    const imageHandler = () => (e) =>{
        e.preventDefault();
        if(dropzoneRef) dropzoneRef.current.open();
    }

    const imageDelete = ()=>(e) =>{
        revoke()
        setUserImg("");
    }
    const saveFile = (path) =>{
        Object.keys(userImgResized).forEach(key=>{
            fetch(userImgResized[key]).then(r=>r.blob()).then((blob)=>{
                var x = new Image();
                x.onload = () =>{
                    const formData = new FormData();
                    formData.append('file',blob);
                    formData.append('path',`/${key}`+path);
                    formData.append('needConvert',false)
                    formData.append('needResize',key<Math.max(x.width,x.height))
                    formData.append('mediaType',"PROFILE")
                    Axios.post("/file/upload",formData,{
                    headers:{
                        'Content-Type':'multipart/form-data',
                    }
                    }).then(res=>{
                        console.log(res)
                    })
                }
                x.src = URL.createObjectURL(blob);
            })
        })
        fetch(userImg).then(r=>r.blob()).then(blob=>{
            const formData = new FormData();
            formData.append('file',blob);
            formData.append('path',path);
            formData.append('needConvert',false)
            formData.append('mediaType',"PROFILE")
            Axios.post("/file/upload",formData,{
              headers:{
                'Content-Type':'multipart/form-data',
              }
            }).then(res=>{
                console.log(res)
            })
        })
    }
    const revoke = () =>{
        const imgURL = userImg
        const resizedImgURL = userImgResized
        if(imgURL.startsWith("blob")){
            console.log("revoke!")
            URL.revokeObjectURL(imgURL)
            Object.keys(resizedImgURL).forEach(key=>{
                URL.revokeObjectURL(resizedImgURL[key])
            })
        }
    }

    const onDrop = async (acceptFile) =>{
        await revoke()
        if(acceptFile[0]) {
            setMediaFormat(acceptFile[0].type.split("/")[1]);
            ResizeImage(acceptFile[0],240).then(resizedImage=>{
                setUserImg(URL.createObjectURL(resizedImage));
            })
            ResizeImage(acceptFile[0],72).then(resizedImage=>{
                setUserImgResized({72:URL.createObjectURL(resizedImage)});
            })
            setIsChanged(true);
        }
    }
    const imageSubmit = () => (e) => {
        e.preventDefault();
        if(userImg.startsWith("blob")){
            const filePath = "profileImg/"+getRandomGenerator(21)+'.'+mediaFormat;
            saveFile(filePath)
            const formData = new FormData();
            formData.append('path',filePath)
            props.request("post","/account/update/img",formData).then(res=>{
                if(res.status===200 && res.data.success){
                    profileImgRef.current.style.margin = "";
                    setIsChanged(false)
                }
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
                    <UserImage src={userImg} userDefaultImg={userDefaultImg}/>
                    <Pencil width="20" height="20" className="myprofile_pencil"/>
                </div>
            </div>
            <SubmitImageBtn isChanged = {isChanged} onClick={imageSubmit}/>
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

const UserImage = ({src, userDefaultImg}) =>{
    if(src!=null){
        if(src.startsWith("blob")){
            return <img className="myprofile_img" src={src}
         alt=""  onError={(e)=>{e.target.onerror=null;e.target.src=userDefaultImg;}}/>
        }else{
            return <img className="myprofile_img" src={`/file/get?name=${src}`}
            alt=""  onError={(e)=>{e.target.onerror=null;e.target.src=userDefaultImg;}}/>   
        }   
    }
    return <img alt="" src={userDefaultImg}/>
}
export default withRouter(authWrapper(MyHeader));