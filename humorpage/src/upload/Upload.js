import ReactQuill, {Quill} from "react-quill"
import React,{Component,createRef} from "react"
import Dropzone from "react-dropzone"
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import {uploadWrapper} from "./UploadWrapper";
import Axios from "axios"
import {getToday, 
  getRandomGenerator,
  isEmpty, 
  ResizeThumbnailImage, 
  sanitizeUrl,
  ResizeImage,
  dataUrltoBlob,
} from "../utils/Utils"
import { ValidationError } from "../forms/ValidationError"
import * as Styled from "./Styled";
import {IconStyled} from "../MainStyled"
import ReactDomServer from "react-dom/server"

const icons = Quill.import('ui/icons')
icons['mycustom'] = ReactDomServer.renderToString(<IconStyled theme="video_sm"/>);
icons['video'] = ReactDomServer.renderToString(<IconStyled theme="youtube_sm"/>);
icons['image'] = ReactDomServer.renderToString(<IconStyled theme="image_sm"/>);


const __ISMSIE__ = navigator.userAgent.match(/Trident/i) ? true : false;

const Video = Quill.import('formats/video');
const IMG = Quill.import('formats/image');
const BlockEmbed = Quill.import('blots/block/embed');

class MediaBlot extends BlockEmbed{
    static create(value){
        const node = super.create();
        const div = document.createElement("div")
        div.className="boardIframeZone";
        node.setAttribute('id',"ql");
        node.className="boardIframe";
        node.setAttribute('frameborder', '0');
        node.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
        node.setAttribute('allowtransparency', true);
        node.setAttribute('allowfullscreen', true);
        node.setAttribute('scrolling', '0');
        node.setAttribute('src',value);
        div.appendChild(node);
        return div;
    }

    static sanitize(url){
      return sanitizeUrl(url);
    }

    static value(node){
      return node.getAttribute('src');
    }
}

MediaBlot.blotName = "video";
MediaBlot.tagName = "iframe";
Quill.register("formats/video",MediaBlot,false);


class CustomImage extends IMG{
  static create(value){
    const node = document.createElement('div')
    const image = new Image();
    image.src = this.getUrl(value)
    this.getSmUrl(node, value)
    image.onload = () => {
      const ratio = (image.naturalWidth/image.naturalHeight).toFixed(5)
      node.setAttribute("style",`max-width:${image.naturalWidth}px;aspect-ratio:${ratio};`)
      node.className="ql-img-div"
    }
    image.classList.add("image-preview")
    image.setAttribute("id","ql")
    node.appendChild(image)
    return node
  }

  static getSmUrl(node,url){
    if(url){
      if(typeof(url)==="string"){
        if(url.startsWith("data")){
          ResizeImage(url,27).then(small=>{
            node.dataset.small = URL.createObjectURL(small)
          })
          return
        }
        node.dataset.small = url.replace("=","=/27")
        return
      }
      else if(url.small){
        node.dataset.small = URL.createObjectURL(url.small)
        return
      }
      node.dataset.small = URL.createObjectURL(url)
    }
  }
  static getUrl(url){
    if(url!=null) {
      if(typeof(url)==="string"){
        if(url.startsWith("data")){
          return URL.createObjectURL(dataUrltoBlob(url))
        }
        return url;
      }
      else if(url.origin!=null){
        return URL.createObjectURL(url.origin)
      }
      else return URL.createObjectURL(url);
    }
    else return null;
  }
}
CustomImage.blotName = 'myimage';

Quill.register("formats/myimage",CustomImage,false);

class CustomVideo extends Video{
  static create(value){
    const node = super.create();
    const video = document.createElement('video')
    video.setAttribute("id","ql")
    const temp = document.createElement('div')
    video.setAttribute('controls',true);
    video.setAttribute('type',"video/mp4");
    video.setAttribute('controlslist','nodownload');
    video.setAttribute('tabindex',"-1");
    video.setAttribute('class',"ng-video");
    temp.setAttribute('class',"video_preview_tempData")
    node.appendChild(video);
    video.onloadeddata = (e) =>{
      if(video.videoWidth===0){
        video.removeAttribute("controls")
        node.style.backgroundColor = "#e8eae6"
        const url = document.createElement("div")
        const play = document.createElement("div")
        play.className = "playBtn";
        url.setAttribute("class","video_preview_tempData_url")
        url.innerText = value.name;
        temp.appendChild(play)
        temp.appendChild(url);
        node.appendChild(temp)
      }
    }
    video.src = this.sanitize(value.blob==null?value:value.blob)
    return node
  }

  static value(node){
    return node.firstElementChild.getAttribute('src');
  }

  static sanitize(url){
    if(url!=null) {
      if(typeof(url)==="string"){
        return url;
      }
      else return URL.createObjectURL(url);
    }
    else return null;
  }
};

CustomVideo.blotName = 'myvideo';
CustomVideo.className = "video-preview";
CustomVideo.tagName = "DIV";

Quill.register('formats/myvideo', CustomVideo, false);

class Upload extends Component {
    constructor(props) {
      super(props)
      this.state = {
        contents: __ISMSIE__ ? "<p>&nbsp;</p>" : "",
        open:"image/*",
        titleErr:null,
        contentErr:null,
      };
      this.mediaDir = null;
      
      this.quillRef = null;
      this.dropzone = null;
      this.mediaFileSend = false;
      this.titleRef = createRef();
      this.quill = null
    }

    componentDidMount(){
      const quill = this.quillRef.getEditor();
      this.quill = quill.root     
      const tooltip = quill.theme.tooltip;
      const bgTarget = this.props.bgRef.current
      //Background click event
      if(bgTarget) bgTarget.addEventListener('click',this.hiddenPage());
      tooltip.save = () =>{
        const url = sanitizeUrl(tooltip.textbox.value)
        if(url!=null) {
          const range = tooltip.quill.selection.savedRange
          quill.insertEmbed(range.index,'video',url,'user');
          quill.setSelection(range.index + 2)
          quill.focus();
        }
        tooltip.hide();
      }
      if(this.mediaDir==null){
        //이후 ip마다 1개씩 할당
        this.props.request("get","/board/dir").then(res=>{
          if(res.status===200 && res.data.success===false){
            this.props.history.push("/login")
          }else{
            this.mediaDir=res.data.data
          }
        })
      }
    }

    sendVideo = async (filePath,elem) =>{
      if(elem.childElementCount>1) elem.removeChild(elem.lastChild)
      elem.removeAttribute("src")
      elem.removeAttribute("style")
      elem.removeAttribute("class")
      elem.setAttribute("class","board_video");
      const video = elem.firstElementChild
      video.removeAttribute("class")
      video.setAttribute("controls","true")
      
      if(video.src.startsWith("blob")){
        await fetch(video.src).then(r=>r.blob()).then(
          async blob=>{
            const dir = getRandomGenerator(10)
            const originPath = filePath+dir+"/"+dir+".m3u8"
            const thumbPath = filePath+dir+"/thumb.jpg"
            video.setAttribute("src", "/api/file/get?name="+originPath)
            await this.saveVideo(elem,blob,originPath,thumbPath)
          }
        )
      }
    }

    sendImage = async (filePath,elem) =>{
      elem.removeAttribute("class")
      const parent = elem.parentElement
      parent.className = "ng-img-div"
      const src = elem.src
      const dataset = elem.parentElement.dataset
      elem.className = "ng-img-small"
      const newOriginFilePath = filePath+getRandomGenerator(10)
      if(src.startsWith("blob")){
        await fetch(src).then(r=>r.blob()).then(
          blob=>{
            const newPath = newOriginFilePath+"."+blob.type.split("/")[1]
            elem.setAttribute("src", "/api/file/get?name="+newPath)
            parent.dataset.lg = elem.getAttribute("src")
            this.saveImage(blob,newPath)
          }
        )
      }
      if(dataset.small.startsWith("blob")){
        await fetch(dataset.small).then(r=>r.blob()).then(
          blob=>{
            const newPath = "/27"+newOriginFilePath+"."+blob.type.split("/")[1]
            elem.parentElement.dataset.small = "/api/file/get?name="+newPath
            this.saveImage(blob,newPath)
          }
        )
      }
      parent.firstChild.src = parent.dataset.small
    }

    send = async (filePath) =>{
      const mediaElems = this.quill.querySelectorAll("#ql")
      Object.values(mediaElems).forEach(media=>this.removeId(media))
      const videos = this.quill.querySelectorAll(".video-preview")
      const videoQuery = Object.values(videos).map(async video=> await this.sendVideo(filePath,video))
      const images = this.quill.querySelectorAll(".image-preview")
      const imageQuery = Object.values(images).map(async image=> await this.sendImage(filePath,image))
      await Promise.all([...imageQuery,...videoQuery])
    }

    removeId = (elem) =>{
      elem.removeAttribute("id")
    }


    checkIsmore = () =>{
      //1. src체크 -> image든 video든 여러개면 x
      if(this.quill.querySelectorAll("#ql").length>1){
        return true;
      }
      //2. text체크 -> 에디터 스크롤 height 이용?
      const height = this.quill.scrollHeight;
      if(height>600){
        return true;
      }
      return false;
    }

    submit = () => async (e) =>{
      e.preventDefault();
      var title = this.titleRef.current.value
      if(isEmpty(title)){
        this.setState({
          titleErr:["제목을 작성해주세요."]
        })
        return
      }
      const filePath = "/"+getToday()+"/"+this.mediaDir+"/"
      // path = /240/path.jpg
      let data = new FormData();
      //썸네일 만들지 여부
      const isMore = this.checkIsmore();
      data.append('more',isMore)
      const mediaElem = this.quill.querySelector("#ql")
      //썸네일은 0.5배로 min height 240 max height 500
      //썸네일 저장소는 사이즈로 구분안되기 때문에 thumb/...로 변경
      if(isMore && mediaElem!==null){
        const fileName = getRandomGenerator(10)
        const newPath = filePath+fileName
        const ResizedFilePath = newPath+"thumb.jpg";
        const tag = mediaElem.tagName
        if(tag==="IMG"){
          //이미지는 원본 보내고 썸네일도 보내야함
          //리사이징 이미지는 jpg 고정 (data size)
          const node = mediaElem.parentElement
          let blob;
          if(mediaElem.src.startsWith('blob')){
            blob = await fetch(mediaElem.src).then(r=>r.blob())
          }else if(mediaElem.src.startsWith('data')){
            blob = await dataUrltoBlob(mediaElem.src)
          }
          const OriginalFilePath = newPath+"."+blob.type.split("/")[1]
          mediaElem.className = "ng-img-small"
          mediaElem.setAttribute("src","/api/file/get?name="+OriginalFilePath)
          this.saveImage(blob,OriginalFilePath,"THUMBNAIL")
          ResizeThumbnailImage(blob).then(resizedImage=>{
            this.saveImage(resizedImage,ResizedFilePath,"THUMBNAIL")
          })
          const dataset = node.dataset
          if(dataset.small.startsWith("blob")){
            await fetch(dataset.small).then(r=>r.blob()).then(
              blob=>{
                const newPath = "/27"+OriginalFilePath
                node.dataset.small = "/api/file/get?name="+newPath
                this.saveImage(blob,newPath)
              }
            )
          }
          node.dataset.lg = node.firstChild.getAttribute("src")
          node.firstChild.src = node.dataset.small
          node.className = "ng-img-div"
          data.append("thumbnailImg",node.outerHTML);
        }else if(tag==="VIDEO"){
          const node = mediaElem.parentElement
          await fetch(mediaElem.src).then(r=>r.blob()).then(async blob=>{
            const OriginalFilePath = newPath+"/"+fileName+".m3u8"
            const thumbPath = newPath+"/thumb.jpg"
            mediaElem.setAttribute("src","/api/file/get?name="+OriginalFilePath)
            await this.saveVideo(node,blob,OriginalFilePath,thumbPath)
          })
          data.append("thumbnailImg",node.outerHTML);
        }else if(tag==="IFRAME"){
          //youtube => https://img.youtube.com/vi/<insert-youtube-video-id-here>/sddefault.jpg
          const youtubePattern = /https:\/\/www\.youtube\.com\/embed\/([^?.]*)\?.*/g
          const src = mediaElem.getAttribute("src");
          const Id = youtubePattern.exec(src)
          const img = new Image()
          const div = document.createElement("div")
          div.className="ng-div-center"
          if(Id){
            img.src = `https://img.youtube.com/vi/${Id[1]}/sddefault.jpg`
            const logo = new Image()
            logo.src = "/api/file/get?name=/youtubelogo.png"
            logo.className = "youtube-logo"
            div.appendChild(img)
            div.appendChild(logo)
            div.setAttribute("style","aspect-ratio:1.334;max-width:640px;")
          }else{
            img.src="/api/file/get?name=/twitchlogo.jpg"
            div.setAttribute("style","aspect-ratio:1.5;max-width:600px;")
            div.appendChild(img)
          }
          data.append("thumbnailImg",div.outerHTML);
        }
      }
      await this.send(filePath)
      const content = this.quill.innerHTML
      if (this.mediaFileSend || mediaElem!==null){
        data.append('title',title)
        data.append('content',content)
        data.append('mediaDir',this.mediaDir)
        Axios.post("/board/upload",data).then(res =>{
          if (res.status ===200){
            this.props.onOffUploadPage(-1);
          }else{
            console.log(res)
          }
        })
      }else{
        this.setState({
          contentErr:["미디어 파일을 포함해야 합니다."],
        })
      }
    }

    saveVideo = async (node,file,path,thumbPath) =>{
      this.mediaFileSend=true
      const formData = new FormData();
      formData.append('file',file);
      formData.append('path',path);
      node.dataset.url = node.firstElementChild.getAttribute("src");
      await Axios.post("/file/upload-video",formData,{
        headers:{
          'Content-Type':'multipart/form-data',
        }
      }).then(res=>{
        if(res.data) return res.data
      }).then(data=>{
        if(data.success){
          //thumb.jpg
          const ratio = data.data.split(":")
          node.setAttribute("style",`max-width:${ratio[0]}px;aspect-ratio:${(ratio[0]/ratio[1]).toFixed(5)}`)
          const image = new Image();
          image.className="ng-thumb"
          image.src = "/api/file/get?name="+thumbPath
          image.onerror = (e) =>{e.preventDefault(); e.target.style.display="none";}
          node.appendChild(image)
          node.removeChild(node.firstElementChild)
          node.className="ng-video"
          const play = document.createElement("div")
          play.className = "playBtn-2";
          node.append(play)
        }else{
          //login
        }
      })
    }

    saveImage = (file,path,mediaType="BOARD") => {
      this.mediaFileSend = true
      const formData = new FormData();
      formData.append('file',file);
      formData.append('path',path);
      formData.append("mediaType",mediaType)
      Axios.post("/file/upload-image",formData,{
        headers:{
          'Content-Type':'multipart/form-data',
        }
      })
    };

    
    onDrop = (acceptedFiles) => {
      try {
        acceptedFiles.reduce((pacc, _file) => {
          const reader =  new FileReader();
          const quill = this.quillRef.getEditor();
          const range = quill.getSelection();
          if (_file.type.split("/")[0]==="video"){
            reader.onload = (e) =>{
              const dataURL = e.target.result;
              const blob = dataUrltoBlob(dataURL);
              const data = {blob:blob,name:_file.name}
              quill.insertEmbed(range.index,"myvideo",data,'user');
              quill.setSelection(range.index + 2);
              quill.focus();
            }
            return reader.readAsDataURL(_file);
          }else{
            reader.onload = (e) =>{
              const dataURL = e.target.result;
              const blob = dataUrltoBlob(dataURL)
              ResizeImage(blob,27).then(small=>{
                const data = {origin:blob,small:small}
                quill.insertEmbed(range.index,"myimage",data,'user');
                quill.setSelection(range.index+2);
                quill.focus();
              })
            }
            return reader.readAsDataURL(_file);
          }
        },Promise.resolve());
      } catch (error) {}
    };

    imageHandler = () => {
      this.setState({
        open:"image/*"
      })
      if (this.dropzone) this.dropzone.open();
    };

    videoHandler = () => {
      this.setState({
        open:"video/*"
      })
      if (this.dropzone) this.dropzone.open();
    }    
  
    modules = {
      toolbar: {
        container: [
          ["image", "mycustom","video"]
        ],
        handlers: { image : this.imageHandler,
          mycustom : this.videoHandler
        }
      },
      clipboard: { matchVisual: false }
    };
  
    formats = [
      "myimage",
      "video",
      "myvideo"
    ];

  onChangeContents = (contents) => {
    let _contents = null;
    if (__ISMSIE__) {
      if (contents.indexOf("<p><br></p>") > -1) {
        _contents = contents.replace(/<p><br><\/p>/gi, "<p>&nbsp;</p>");
      }
    }
    this.setState({ contents: _contents || contents,contentErr:null, });
  };
  
  onChangeTitle = (title) =>{
    if(isEmpty(title)){
      this.setState({
        titleErr:["제목을 작성해주세요."],
      })
    }else{
      this.setState({
        titleErr:null,
      })
    }
  }

  hiddenPage = () => (e) =>{
    const bgTarget = this.props.uploadPageRef.current
    if(bgTarget) bgTarget.style.display = "none";
  }

  render() {
    return (
      <Styled.UploadBoxStyled>
        <Styled.DeleteBtnStyled onClick={this.hiddenPage()}/>
        <Styled.TitleZoneStyled>
          <Styled.TitleInputStyled 
          type="text" ref={this.titleRef} 
          onChange={e=>{e.preventDefault(); this.onChangeTitle(e.target.value)}}/>
          <ValidationError errors={this.state.titleErr}/>
        </Styled.TitleZoneStyled>
        <Styled.MainContentStyled>
        <ReactQuill
          ref={(el)=>(this.quillRef = el)}
          value={this.state.contents}
          onChange={this.onChangeContents}
          theme="snow"
          modules={this.modules}
          formats={this.formats}
        />
        <ValidationError errors = {this.state.contentErr}/>
        <Dropzone
          ref = {(el)=>(this.dropzone = el)}
          accept = {this.state.open}
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
      </Styled.MainContentStyled>
      <Styled.SubmitStyled type="submit" onClick={this.submit()}>저장</Styled.SubmitStyled>
      </Styled.UploadBoxStyled>
    )
  }
}


export default uploadWrapper(authWrapper(withRouter(Upload)));