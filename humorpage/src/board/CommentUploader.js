import React, {useRef,useState} from "react"
import Merge from "../static/img/merge.png"
import Dropzone from "react-dropzone"
import {getToday, getRandomGenerator,isEmpty, ResizeImage, ResizeImageDefault} from "../utils/Utils"
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
        if(!isEmpty(commentImg)){
            const filePath = "/"+getToday()+"/"+getRandomGenerator(10)+'.'+mediaFormat;
            saveFile(filePath)
            data.append('media',filePath)
        }
        if(!isEmpty(content)||!isEmpty(commentImg)){
            data.append('content', content)
            data.append('board_id',board_id)
            data.append('comment_id',comment_id)
            const blob = {};
            blob.commentImg = commentImg
            blob.commentResizedImg = commentResizedImg
            props.request('post',"/comment/upload",data).then(res=>{
                console.log(res)
                console.log(props)
                if(res.status===200 && res.data.success){

                    if(mediaRef.current!=null) mediaRef.current.style.display="none";
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
        if(acceptFile[0]) {
            setMediaFormat(acceptFile[0].type.split("/")[1]);
            ResizeImage(acceptFile[0],200).then(resizedImage=>{
                setCommentResizedImg({200:URL.createObjectURL(resizedImage)});
            })
            ResizeImageDefault(acceptFile[0]).then(defaultImage=>{
                setCommentImg(URL.createObjectURL(defaultImage))
                setImageOnOff(true)
            })
        }
    }
    const saveFile = (path) => {
        Object.keys(commentResizedImg).forEach(key=>{
            fetch(commentResizedImg[key]).then(r=>r.blob()).then(blob=>{
                var x = new Image();
                x.onload = () =>{
                    const formData = new FormData();
                    formData.append('file',blob);
                    formData.append('path',`/${key}`+path);
                    formData.append('needConvert',false)
                    formData.append('needResize',key<Math.max(x.width,x.height))
                    formData.append('mediaType',"COMMENT")
                    Axios.post("/file/upload",formData,{
                        headers:{
                            'Content-Type':'multipart/form-data',
                        }
                    })
                }
                x.src = URL.createObjectURL(blob);
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
    return <CommentUploaderStyled>
        {props.cname?<RecommentTargetStyled>@{props.cname}</RecommentTargetStyled>:null}
        <CommentTextAreaStyled ref={contentRef}></CommentTextAreaStyled>
        <CommentPreImgZoneStyled>
            <ImageResized src={commentImg}
                mediaRef={mediaRef}
                setImageOnOff={setImageOnOff}/>
            <ImageDeleteBtn onOff={imageOnOff} imageDelete={imageDelete}></ImageDeleteBtn>
        </CommentPreImgZoneStyled>
        <CommentBottomStyled>
            <CameraStyled onClick={imageHandler()}/>
        <CommentBtnStyled 
        onClick={submitComment(props.board_id, props.comment_id, props.cname)}
        type="submit">
            등록
        </CommentBtnStyled>
        </CommentBottomStyled>
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
    </CommentUploaderStyled>
}

const ImageResized = ({src,mediaRef, setImageOnOff}) =>{
    if(src) return <img alt=""
        className="comment_preimg"
        ref={mediaRef}
        src={src}
        onLoad={e=>{e.target.style.removeProperty("display")}}
        onError={e=>{e.target.onerror=null;e.target.style.display="none";
        setImageOnOff(false);}}/>
    return null;
}

const ImageDeleteBtn = ({onOff, imageDelete}) => {
    if(onOff) return <ImageDeleteBtnStyled onClick={imageDelete()}></ImageDeleteBtnStyled>
    else return null;
}

const RecommentTargetStyled = styled.span`
    margin: 5px;
    margin-bottom: 10px;
    font-size: 1em;
    font-weight: 700;
`

const CommentUploaderStyled = styled.div`
    position: relative;
    width: 90%;
    margin: auto;
    background-color: #ffffff;
    margin-top: 20px;
    padding:10px;
`

const CommentTextAreaStyled = styled.textarea`
    width: 100%;
    box-sizing: border-box;
    padding: 20px 0px 5px 20px;
    height: 100px;
    border-style: none;
    resize: none;
`

const CommentPreImgZoneStyled = styled.div`
    position: relative;
    width: fit-content;
    height: fit-content;
`
const CommentBottomStyled = styled.div`
    height:50px;
    display:flex;
`

const CommentBtnStyled = styled.button`
    cursor: pointer;
    float: right;
    right: 10px;
    position: relative;
    z-index: 1;
    color: antiquewhite;
    background: #f05454;
    border: solid #d8d8d8 1px;
    padding: 10px;
`


const CameraStyled = styled.div`
    width:32px;
    height:32px;
    background-image:url(${Merge});
	background-repeat: no-repeat;
	background-position: -32px 0px;
    cursor: pointer;
    margin:10px 5px;
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

export default authWrapper(CommentUploader);