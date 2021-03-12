import React, {useRef,useState} from "react"
import {ReactComponent as Camera} from "../static/svg/camera.svg"
import Dropzone from "react-dropzone"
import {getToday, getRandomGenerator,isEmpty, dataUrltoBlob, ResizeImage} from "../utils/Utils"
import {authWrapper} from "../auth/AuthWrapper"
import {useHistory} from "react-router-dom"
import Axios from "axios"
import styled from "styled-components"

function CommentUploader({...props}){
    
    const [imageOnOff,setImageOnOff] = useState(false);
    const [commentImg, setCommentImg] = useState(null);
    const [commentResizedImg, setCommentResizedImg] = useState({});
    const [mediaFormat, setMediaFormat] = useState(null);
    const mediaRef = useRef();
    const dropzoneRef = useRef();
    const contentRef = useRef();
    let history = useHistory();
    
    const submitComment = (board_id,comment_id,cname) => async(e) =>{
        let data = new FormData();
        let content = contentRef.current.value
        if(cname!=null){
            content=`<span class="recomment_target">@${cname}</span>`+content
        }
        const filePath = "/"+getToday()+"/"+getRandomGenerator(10)+'.'+mediaFormat;
        if(!isEmpty(commentImg)){
            saveFile(filePath)
        }
        if(!isEmpty(content)||!isEmpty(commentImg)){
            data.append('content', content)
            data.append('board_id',board_id)
            data.append('comment_id',comment_id)
            data.append('media',filePath)
            const blob = {};
            blob.commentImg = commentImg
            blob.commentResizedImg = commentResizedImg
            props.request('post',"/comment/upload",data).then(res=>{
                if(res.status===200 && res.data.success){
                    mediaRef.current.style.display="none";
                    contentRef.current.value="";
                    setImageOnOff(false)
                    const comment = res.data.data
                    comment.blob = blob;
                    comment.media = null;
                    props.appendComment(comment)
                }else{
                    history.push("/login")
                }
            })
        }else{
            alert("내용을 입력해주세요.")
        }
    }
    

    const onDrop = (acceptFile) => {
        const reader = new FileReader();
        reader.onload = (e) =>{
            const blobURL = URL.createObjectURL(dataUrltoBlob(e.target.result))
            setCommentImg(blobURL);
            setImageOnOff(true);
        }
        if(acceptFile[0]) {
            setMediaFormat(acceptFile[0].type.split("/")[1]);
            ResizeImage(acceptFile[0],200).then(resizedImage=>{
                setCommentResizedImg({200:URL.createObjectURL(resizedImage)});
            })
            reader.readAsDataURL(acceptFile[0]);
        }
    }
    const saveFile = (path) => {
        Object.keys(commentResizedImg).forEach(key=>{
            fetch(commentResizedImg[key]).then(r=>r.blob()).then(blob=>{
                const formData = new FormData();
                formData.append('file',blob);
                formData.append('path',`/${key}`+path);
                formData.append('needConvert',false)
                formData.append('mediaType',"COMMENT")
                Axios.post("/file/upload",formData,{
                  headers:{
                    'Content-Type':'multipart/form-data',
                  }
                })
            })
        })
        fetch(commentImg).then(r=>r.blob()).then(blob=>{
            const formData = new FormData();
            formData.append('file',blob);
            formData.append('path',path);
            formData.append('needConvert',false)
            formData.append('mediaType',"COMMENT")
            Axios.post("/file/upload",formData,{
              headers:{
                'Content-Type':'multipart/form-data',
              }
            })
        })
    }

    const imageDelete = () => (e) =>{
        mediaRef.current.style.display="none"
        URL.revokeObjectURL(commentImg);
        URL.revokeObjectURL(commentResizedImg)
        setImageOnOff(false);
    }
    const imageHandler = () => (e) =>{
        if(dropzoneRef) dropzoneRef.current.open();
    }
    if(props.onOff===false) return null;
    return <div className="comment-input">
        {props.cname?<span className="recomment_target_preview">@{props.cname}</span>:null}
        <textarea ref={contentRef} className="comment_textarea"></textarea>
        <div className="comment_preimgzone">
            <ImageResized src={commentImg}
                srcSet={commentResizedImg}
                mediaRef={mediaRef}
                setImageOnOff={setImageOnOff}/>
            <ImageDeleteBtn onOff={imageOnOff} imageDelete={imageDelete}></ImageDeleteBtn>
        </div>
        <div className="comment_bottom">
            <CameraStyled width="30" height="30" onClick={imageHandler()}/>
        <button className="comment_btn" onClick={submitComment(props.board_id, props.comment_id, props.cname)} type="submit">등록</button>
        </div>
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

const ImageResized = ({src,srcSet,mediaRef, setImageOnOff}) =>{
    const srcset = Object.keys(srcSet).map(key=>{
        return `${srcSet[key]} ${key}w,`
    }).join("\n")
    if(src) return <img alt=""
        className="comment_preimg"
        ref={mediaRef}
        srcSet={srcset}
        src={src}
        onLoad={e=>{e.target.style.removeProperty("display")}}
        onError={e=>{e.target.onerror=null;e.target.style.display="none";
        setImageOnOff(false);}}/>
    return null;
}


const CameraStyled = styled(Camera)`
    cursor: pointer;
    float: left;
    position: relative;
    z-index: 1;
    padding: 10px;
`

const ImageDeleteBtn = ({onOff, imageDelete}) => {
    if(onOff) return <ImageDeleteBtnStyled onClick={imageDelete()}></ImageDeleteBtnStyled>
    else return null;
}

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

export default authWrapper(CommentUploader);