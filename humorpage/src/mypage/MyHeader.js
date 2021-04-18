import React, {useState,useRef} from 'react';
import userDefaultImg from "../static/img/userDefault.png";
import {authWrapper} from "../auth/AuthWrapper"
import {withRouter} from 'react-router-dom'
import {IconStyled} from "../MainStyled"
import Dropzone from "react-dropzone"
import Axios from "axios"
import styled from "styled-components"
import {getRandomGenerator, ResizeImage} from "../utils/Utils"

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
        if(user.userImg!==""){
            setIsChanged(true);
        }
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
        let filePath;
        if(userImg.startsWith("blob")){
            filePath = "/profileImg/"+getRandomGenerator(21)+'.'+mediaFormat;
            saveFile(filePath)
            
        }else{
            filePath = ""
        }
        const formData = new FormData();
        formData.append('path',filePath)
        props.request("post","/account/update/img",formData).then(res=>{
            console.log(res)
            if(res.status===200 && res.data.success){
                profileImgRef.current.style.margin = "";
                setIsChanged(false)
            }
        })
    }
    if(user===null){
        return null;
    }
    return <MyPageHeader>
        <MyProfile>
            <MyProfileImgZone>
                <ProfileImgDelete onClick={imageDelete()}></ProfileImgDelete>
                <ImagePartStyled ref={profileImgRef} onClick={imageHandler()}>
                    <UserImage src={userImg} userDefaultImg={userDefaultImg}/>
                    <PencilStyled
                        theme="pencil_sm"/>
                </ImagePartStyled>
            </MyProfileImgZone>
            <SubmitImageBtn isChanged = {isChanged} onClick={imageSubmit}/>
        </MyProfile>
    <MyProfileTextZone>
        <MyPageUserName>{user.name}</MyPageUserName>
        <MyProfileLogStlyed>
            게시물 {user.total_board_num} 개
        </MyProfileLogStlyed>
        <MyProfileLogStlyed>
            댓글 {user.total_comment_num} 개
        </MyProfileLogStlyed>
    </MyProfileTextZone>

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
    </MyPageHeader>
}

const UserImage = ({src, userDefaultImg}) =>{
    if(src!=null){
        if(src.startsWith("blob")){
            return <MyProfileImg src={src}
         alt=""  onError={(e)=>{e.target.onerror=null;e.target.src=userDefaultImg;}}/>
        }else{
            return <MyProfileImg className="myprofile_img" src={`/api/file/get?name=${src}`}
            alt=""  onError={(e)=>{e.target.onerror=null;e.target.src=userDefaultImg;}}/>   
        }   
    }
    return <MyProfileImg alt="" src={userDefaultImg}/>
}

const SubmitImageBtn = ({isChanged, onClick}) => {
    if(isChanged) return <SubmitImageBtnStyled onClick={onClick()}>변경 완료</SubmitImageBtnStyled>
    else return null;
}


const MyProfileTextZone = styled.span`
    width:220px;
`

const MyProfileImg = styled.img`
    width: 50px;
    height: 50px;
    border-radius: 25px;
`

const MyProfileImgZone = styled.div`
    position: relative;
    cursor: pointer;
    width: 60px;
    height: 60px;
    border: solid 1px #dddddd;
    margin: 10px;
`

const ImagePartStyled = styled.div`
    text-align: center;
    padding: 5px;
`

const PencilStyled = styled(IconStyled)`
    position: absolute;
    right: 0px;
    bottom: 0px;
    opacity: 0.5;
    ${ImagePartStyled}:hover &{
        opacity:1.0;
    }
`

const MyPageHeader = styled.div`
    position:relative;
    display:flex;
`
const MyProfile = styled.div`
    position:relative;
    display:flex;
    padding: 4px;
`

const MyProfileLogStlyed = styled.div`
    font-size:0.9em;
`

const MyPageUserName = styled.div`
    font-size: 1.2em;
    margin: 10px 0px 10px 0px;
    font-weight: 700;
`

const SubmitImageBtnStyled = styled.button`
    width: 50px;
    height: 20px;
    font-size: 0.5em;
    padding: 0px;
    position: absolute;
`

const ProfileImgDelete = styled.button`
    position: absolute;
    top: -8px;
    right: -8px;
    width: 16px;
    height: 16px;
    border-radius: 18px;
    border: 0px;
    opacity: 0.4;
    z-index: 1;
    background-color: #fff;
    &:hover{
        opacity:1;
    }
    &::before, &::after{
        position: absolute;
        left: 7px;
        bottom: 0px;
        content: ' ';
        height: 16px;
        width: 2px;
        background-color: #333;
    }
    &::before{
        transform: rotate(45deg);
    }
    &::after{
        transform: rotate(-45deg);
    }
`



export default withRouter(authWrapper(MyHeader));