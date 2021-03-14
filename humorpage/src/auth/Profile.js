import React, { useState,createRef} from "react"
import { useHistory } from "react-router-dom"
import userDefaultImg from "../static/img/user_128x.png";
import Dropzone from "react-dropzone"
import {authWrapper} from "./AuthWrapper";
import {ReactComponent as Pencil} from '../static/svg/pencil.svg'
import {AgeSelector, getRandomGenerator, ResizeImage} from "../utils/Utils"
import Axios from "axios";
import { ValidationSuccess } from "../forms/ValidationSuccess";
import styled from "styled-components"

function Profile({userDetail,...props}){
    const [userImg,setUserImg] = useState(userDetail.userImg==null?"":userDetail.userImg)
    const [name,setName] = useState(userDetail.name==null?"":userDetail.name)
    const [gender, setGender] = useState(userDetail.gender==null?"Male":userDetail.gender)
    const [age, setAge] = useState(userDetail.age==null?0:userDetail.age)
    const [canSubmit, setCanSubmit] = useState(null)
    const [mediaFormat, setMediaFormat] = useState(null)
    const [userImgResized, setUserImgResized] = useState({})
    const prevName = userDetail.name
    let history = useHistory();
    const dropzoneRef = createRef()
    let CheckedName = null;

    const imageHandler = () => (e) =>{
        e.preventDefault();
        if(dropzoneRef) dropzoneRef.current.open();
    }
    const checkDuplicate = () => (e) => {
        let target = e.target
        const value = target.previousElementSibling.value
        if(value!==CheckedName){
            Axios.get(`/account/checkdup/name?name=${value}`).then(res=>{
                if(res.status===200){
                    return res.data
                }
            }).then(res=>{
                CheckedName = value
                if(res.success) setCanSubmit("사용 가능한 NAME입니다.");
                else setCanSubmit("중복된 NAME 입니다.")
            })
        }
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
        }
    }
    const saveFile = (path) =>{
        Object.keys(userImgResized).forEach(key=>{
            fetch(userImgResized[key]).then(r=>r.blob()).then(blob=>{
                const formData = new FormData();
                formData.append('file',blob);
                formData.append('path',`/${key}`+path);
                formData.append('needConvert',false)
                formData.append('mediaType',"PROFILE")
                Axios.post("/file/upload",formData,{
                  headers:{
                    'Content-Type':'multipart/form-data',
                  }
                })
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
    const genderHandler = () => (e)=>{
        if(e.target.checked){
            setGender(e.target.value)
        }
    }
    const submit = () => async (e) =>{
        if(name!=null && 
            (prevName===name||(canSubmit!==null&&canSubmit.startsWith("사")))){
            let form = new FormData();
            form.append('uid',userDetail.uid)
            form.append('name',name)
            form.append('gender',gender)
            form.append('age',age)
            form.append('isPlatForm',true)
            if(userImg.startsWith("blob")){
                const filePath = "/profileImg/"+getRandomGenerator(21)+'.'+mediaFormat;
                form.append('userImg',filePath)
                Axios.post("/account/signup",form).then(
                    res=>{
                        if(res.data.success){
                            const formData = new FormData();
                            formData.append("uid",userDetail.uid);
                            props.request("post","/account/anologin",formData).then(res=>{
                                if(res.data.success){
                                    saveFile(filePath)
                                    history.push("/boards")
                                }
                            })
                        }else{
                            console.log(res)
                        }
                    }
                )
            }else{
                form.append('userImg',userImg);
                Axios.post("/account/signup",form).then(
                    res=>{
                        if(res.data.success){
                            const formData = new FormData();
                            formData.append("uid",userDetail.uid);
                            props.request("post","/account/anologin",formData).then(res=>{
                                if(res.data.success){
                                    history.push("/boards")
                                }
                            })
                        }else{
                            console.log(res)
                        }
                    }
                )
            }
        }else{
            if(name==null) setCanSubmit("내용을 입력해주세요.");
            else setCanSubmit("중복 확인이 필요합니다.");
        }
    }
    const imageDelete = ()=>(e) =>{
        revoke()
        setUserImg("");
    }
    return <React.Fragment>
        <TopDiv>추가 정보 작성</TopDiv>
        <SignupDiv>
            <div className="myprofile">
                <div className="myprofile_imgzone">
                    <ImageDeleteBtnStyled onClick={imageDelete()}></ImageDeleteBtnStyled>
                    <div onClick={imageHandler()}>
                        <MyProfileResizedImage src={userImg} defaultImg = {userDefaultImg}/>
                        <Pencil width="20" height="20" className="myprofile_pencil"/>
                    </div>
                </div>
            </div>
            <NameInputForm userName={name}
                pathName={history.location.pathname}
                setName={setName}
                checkDuplicate={checkDuplicate}/><br/>
            <ValidationSuccess success={canSubmit}/>
            <label><input type="checkbox" name="gender" value="Male"
            checked={gender==="Male"?true:false}
            onChange={genderHandler()}></input>남성</label>
            <label><input type="checkbox" name="gender" value="Female"
            checked={gender==="Female"?true:false}
            onChange={genderHandler()}></input>여성</label><br/>
            <label>생년
                <select name="age" value={age} onChange={e=>{e.preventDefault();setAge(e.target.value);}}>
                <AgeSelector/>
            </select></label>
            <br/>
            <button onClick={submit()}>작성 완료</button>
            <button onClick={(e)=>{e.preventDefault();history.goBack();}}>취소</button>
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
        </SignupDiv>
    </React.Fragment>
}

const NameInputForm = ({userName, pathName, setName, checkDuplicate})=>{
    if(pathName==="/login"){
        return <React.Fragment>
            <input type="text" value={userName} 
        onChange={e=>{e.preventDefault();setName(e.target.value)}}></input>
        <button onClick={checkDuplicate()}>중복확인</button>
        </React.Fragment>
    }else{
        return <input type="text" value={userName} disabled/>
    }
}

export const MyProfileResizedImage = ({src, defaultImg})=>{
    if(defaultImg===null){
        return <MyProfileStyledImage alt="" 
        src={src} 
        onError={e=>{e.target.onError=null;e.target.style.display="none"}}/>
    }
    return <MyProfileStyledImage alt="" 
    src={src} 
    onError={e=>{e.target.onError=null;e.target.src=defaultImg}}/>
}

const TopDiv = styled.div`
    font-size: 20px;
    font-weight: 700;
    margin: 20px;
    border-bottom: 1px solid black;
`
const SignupDiv = styled.div`
    padding:20px
`

const MyProfileStyledImage = styled.img`
    width: 120px;
    height: 120px;
    border: 1px solid #dddddd;
    border-radius: 75px;
`

const ImageDeleteBtnStyled = styled.button`
    position:absolute;
    top:-5px;
    right:-5px;
    width: 19px;
    height: 19px;
    border-radius: 10px;
    border: 0px;
    opacity: 0.3;
    &:hover{
        opacity:1;
    }
    &::before, &::after{
        position:absolute;
        left: 8px;
        bottom: 0px;
        content: ' ';
        height: 19px;
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

export default authWrapper(Profile);