import React, {useRef,useState,useEffect} from "react"
import {IconStyled} from "../MainStyled"
import Dropzone from "react-dropzone"
import {
    getRandomGenerator,
    isEmpty,
    ResizeImage,
    splitCname} from "../utils/Utils"
import {authWrapper} from "../auth/AuthWrapper"
import {boardWrapper} from "../board/BoardWrapper"
import Axios from "axios"
import styled from "styled-components"
import ReactDomServer from "react-dom/server"


function CommentUploader({...props}){
    const c = props.c
    const inputSet = c&&c.content?splitCname(c.content):null
    const cname = props.cname || (inputSet?inputSet.cname:null)
    const content = c&&c.content?inputSet.content:""
    const [Img, setImg] = useState(null);
    const dropzoneRef = useRef();
    const contentRef = useRef();

    useEffect(()=>{
        if(c&&c.media){
            const div = document.createElement("div")
            div.outerHTML = c.media
            setImg(div)
        }
    },[])
    
    const submitComment = async () =>{
        const user = props.user
        if(user==null){
            props.setAuthPageOption(0);
            return
        }
        let data = new FormData();
        let content = contentRef.current.innerText
        if(cname!=null){
            content=`<span class="recomment_target">@${cname}</span>`+content
        }
        let tmpUrl = {}
        if(Img){
            tmpUrl = Img.dataset
            const src = Img.dataset.lg
            if(src.startsWith("blob")){
                await saveFile()
            }
            data.append('media',Img.outerHTML)
        }
        if(!isEmpty(content)||!!Img){
            if(c) data.append('id',c.id)
            data.append('content', content)
            data.append('board_id',props.board_id)
            data.append('authorNum',user.userNum)
            data.append('authorName',user.name)
            data.append('authorImg',user.userImg?user.userImg:"")
            if(props.comment_id) data.append('comment_id',props.comment_id)
            props.request('post',"/comment/upload",data).then(res=>{
                if(res.status===200) return res.data
            }).then(res=>{
                if(res.success){
                    const comment = res.data
                    //아직 업로드 안된 미디어 파일 대신 blob url 사용
                    if(Img){
                        Img.dataset.sm = tmpUrl.sm
                        Img.dataset.lg = tmpUrl.lg
                        comment.media = Img.outerHTML;
                    }
                    //수정모드
                    if(props.success) props.success(comment)
                    //업로드모드
                    else if(props.appendComment) props.appendComment(comment)
                    if(contentRef.current) contentRef.current.innerText="";
                    setImg(null)
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
            const div = document.createElement("div")
            div.className="ql-img-div"
            const img = new Image();
            img.onload = () =>{
                const ratio = Math.ceil10(img.naturalWidth/img.naturalHeight,-4)
                div.style.aspectRatio=ratio
                div.dataset.width=img.naturalWidth
                setImg(div)
            }
            ResizeImage(acceptFile[0],100).then(resizedImage=>{
                div.dataset.sm = URL.createObjectURL(resizedImage)
            })
            ResizeImage(acceptFile[0]).then(defaultImage=>{
                div.dataset.lg = URL.createObjectURL(defaultImage)
                img.src = div.dataset.lg
                div.style.width="100px"
                div.appendChild(img)
            })
        }
    }
    const saveFile = async() => {
        let sm = Img.dataset.sm
        let lg = Img.dataset.lg
        Img.removeChild(Img.firstElementChild)
        Img.className = "ng-img-div"
        await fetch(sm).then(r=>r.blob()).then(blob=>{
            const formData = new FormData();
            const filePath = props.boardMediaDir[props.board_id]+"/cmt/"
            const newName = getRandomGenerator(10)
            const type = blob.type.split("/")[1]
            const fileName = filePath+newName+"."+type
            formData.append("file",blob)
            formData.append("path",fileName)
            formData.append('needResize',type==="gif")
            formData.append("mediaType","COMMENT")
            Axios.post("/file/upload/image",formData,{
                headers:{
                    'Content-Type':'multipart/form-data',
                }
            })
            Img.dataset.sm = "/api/file/get?name="+fileName
        })
        await fetch(lg).then(r=>r.blob()).then(blob=>{
            const formData = new FormData();
            const filePath = props.boardMediaDir[props.board_id]+"/cmt/"
            const newName = getRandomGenerator(10)
            const type = blob.type.split("/")[1]
            const fileName = filePath+newName+"."+type
            formData.append("file",blob)
            formData.append("path",fileName)
            formData.append('needResize',false)
            formData.append("mediaType","COMMENT")
            Axios.post("/file/upload/image",formData,{
                headers:{
                    'Content-Type':'multipart/form-data',
                }
            })
            Img.dataset.lg = "/api/file/get?name="+fileName
        })
    }
    const imageDelete = () => {
        URL.revokeObjectURL(Img.dataset.sm);
        URL.revokeObjectURL(Img.dataset.lg);
        setImg(null);
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
        <CommentPreImgZone Img={Img} imageDelete={imageDelete}/>
        <CommentUploadBtnStyled>
            <CommentBottomStyled>
                <CameraStyled 
                theme="camera_lg"
                onClick={imageHandler()}/>
            <CommentBtnStyled 
            onClick={submitComment}
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

const CommentPreImgZone = ({Img,imageDelete}) =>{
    const ImgZoneRef = useRef()
    useEffect(()=>{
        if(ImgZoneRef.current){
            ImgZoneRef.current.lastElementChild.addEventListener('click',imageDelete)
        }
    },[Img])
    if(Img){
        const html = Img.outerHTML+ReactDomServer.renderToString(
            <ImageDeleteBtnStyled/>
        )
        return <CommentPreImgZoneStyled 
        ref={ImgZoneRef}
        dangerouslySetInnerHTML={{__html:html}}>
        </CommentPreImgZoneStyled>
    }
    return null;
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

export default boardWrapper(authWrapper(CommentUploader));