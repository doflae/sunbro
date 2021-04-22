import React, {useRef,useState,useEffect} from "react"
import {IconStyled} from "../MainStyled"
import Dropzone from "react-dropzone"
import {getToday,
    getRandomGenerator,
    isEmpty,
    ResizeImage, 
    ResizeImageDefault,
    splitCname} from "../utils/Utils"
import {authWrapper} from "../auth/AuthWrapper"
import Axios from "axios"
import styled from "styled-components"

function CommentUploader({...props}){
    const c = props.c
    const inputSet = c&&c.content?splitCname(c.content):null
    const cname = props.cname || (inputSet?inputSet.cname:null)
    const content = c&&c.content?inputSet.content:""
    const [imageOnOff,setImageOnOff] = useState(false);
    const [commentImg, setCommentImg] = useState(null);
    const [commentResizedImg, setCommentResizedImg] = useState({});
    const [mediaFormat, setMediaFormat] = useState(null);
    const mediaRef = useRef();
    const dropzoneRef = useRef();
    const contentRef = useRef();

    useEffect(()=>{
        if(c&&c.media){
            setCommentImg(`/api/file/get?name=${c.media}`)
            setCommentResizedImg(`/api/file/get?name=/200${c.media}`)
            setImageOnOff(true)
        }
    },[])
    
    const submitComment = () => (e) =>{
        let data = new FormData();
        let content = contentRef.current.innerText
        if(cname!=null){
            content=`<span class="recomment_target">@${cname}</span>`+content
        }
        if(!isEmpty(commentImg)){
            if(commentImg.startsWith("blob")){
                const filePath = "/"+getToday()+"/"+getRandomGenerator(10)+'.'+mediaFormat;
                saveFile(filePath)
                data.append('media',filePath)
            }else{
                data.append('media',c.media)
            }
        }
        if(!isEmpty(content)||!isEmpty(commentImg)){
            if(c) data.append('id',c.id)
            data.append('content', content)
            data.append('board_id',props.board_id)
            if(props.comment_id) data.append('comment_id',props.comment_id)
            const blob = {};
            blob.commentImg = commentImg
            blob.commentResizedImg = commentResizedImg
            props.request('post',"/comment/upload",data).then(res=>{
                if(res.status===200) return res.data
            }).then(res=>{
                if(res.success){
                    if(mediaRef.current!=null) mediaRef.current.style.display="none";
                    contentRef.current.innerText="";
                    setImageOnOff(false)
                    const comment = res.data.data
                    comment.blob = blob;
                    comment.media = null;
                    if(props.success) props.success(comment)
                    else props.appendComment(comment)
                }else if(res.code){
                    //삭제된 상위 글
                    //caller에서 callbackcancel
                    alert(props.failedMsg)
                    //재조회
                    props.failedHandler()
                }
                else{
                    //todo history -> props.pageOption
                    //history.push("/login")
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
        {cname?<RecommentTargetStyled>@{cname}</RecommentTargetStyled>:null}
        <CommentTextAreaStyled
            contentEditable={true}
            aria-label="댓글을 입력해주세요..."
            dangerouslySetInnerHTML={{__html:content}}
            ref={contentRef}></CommentTextAreaStyled>
        <CommentPreImgZoneStyled>
            <ImageResized src={commentImg}
                mediaRef={mediaRef}
                setImageOnOff={setImageOnOff}/>
            <ImageDeleteBtn onOff={imageOnOff} imageDelete={imageDelete}></ImageDeleteBtn>
        </CommentPreImgZoneStyled>
        <CommentUploadBtnStyled>
            <CommentBottomStyled>
                <CameraStyled 
                theme="camera_lg"
                onClick={imageHandler()}/>
            <CommentBtnStyled 
            onClick={submitComment()}
            type="submit">
                등록
            </CommentBtnStyled>
            {props.cancel?<CommentBtnStyled
            onClick={props.cancel()}>
                취소
            </CommentBtnStyled>:null}
            </CommentBottomStyled>
        </CommentUploadBtnStyled>
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
    width: 96%;
    margin: auto;
    border-radius: 20px;
    background-color: #e9e9e9;
    margin-top: 20px;
    padding: 10px;
    overflow:auto;
`

const CommentTextAreaStyled = styled.div`
    background-color:#e9e9e9;
    -webkit-user-modify: read-write-plaintext-only;
    user-modify:read-write;
    max-width:100%;
    width:fit-content;
    display:inline-block;
    box-sizing: border-box;
    padding: 5px 10px;
    height: fit-content;
    border-style: none;
    resize: none;
    &:empty::before {
        content:attr(aria-label);
        opacity:0.5;
        cursor:text;
    }
`

const CommentPreImgZoneStyled = styled.div`
    position: relative;
    display:block;
    width: fit-content;
    max-width:200px;
    height: fit-content;
    max-height:200px;
`

const CommentUploadBtnStyled = styled.div`
    float:right;
`

const CommentBottomStyled = styled.div`
    height:50px;
    display:flex;
    position:relative;
    float:right;
    height:fit-content;
    width:fit-content;
`

const CommentBtnStyled = styled.div`
    cursor:pointer;
    z-index: 1;
    color: antiquewhite;
    background: #f05454;
    border: solid #d8d8d8 1px;
    padding: 5px;
    height:32px;
    border-radius:10px;
`


const CameraStyled = styled(IconStyled)`
    margin-right:10px;
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