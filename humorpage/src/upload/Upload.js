import ReactQuill, {Quill} from "react-quill"
import React,{Component,createRef} from "react"
import Dropzone from "react-dropzone"
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import {uploadWrapper} from "./UploadWrapper";
import Axios from "axios"
import {getToday, getRandomGenerator,isEmpty, ResizeThumbnailImage, sanitizeUrl, dataUrltoBlob} from "../utils/Utils"
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
const Image = Quill.import('formats/image');
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


class CustomImage extends Image{
  static create(value){
    const image = document.createElement('img')
    image.src = this.getUrl(value)
    image.setAttribute("style","max-height:100%;max-width:100%;")
    image.className="image_preview"
    image.setAttribute("id","ql")
    return image
  }
  static getUrl(url){
    if(url!=null) {
      if(typeof(url)==="string"){
        return url;
      }
      else return URL.createObjectURL(url);
    }
    else return null;
  }
}

CustomImage.blotName = 'image';

Quill.register("formats/image",CustomImage,false);

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
    video.setAttribute('style',"max-height:100%;max-width:100%;postion:relative;margin:3px;");
    video.setAttribute('class',"video_preview");
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
CustomVideo.className = "ql-prevideo";
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
    }

    componentDidMount(){
      const quill = this.quillRef.getEditor();      
      const tooltip = quill.theme.tooltip;
      const bgTarget = this.props.bgRef.current
      //Background click event
      if(bgTarget) bgTarget.addEventListener('click',this.hiddenPage());
      //이전 hidden 함수에 의한 display 변경 복구
      const ref = this.props.uploadPageRef
      // if(ref) {
      //   console.log(ref.style);
      //   ref.style.display="";
      // }else{
      //   console.log(ref)
      // }
      //
      // quill.clipboard.addMatcher("DIV",(node,delta)=>{
      //   delta.insert({'myvideo':node.firstElementChild.getAttribute('src')})
      //   return delta;
      // })
      tooltip.save = () =>{
        const url = sanitizeUrl(tooltip.textbox.value)
        console.log(url)
        if(url!=null) {
          const range = tooltip.quill.selection.savedRange
          quill.insertEmbed(range.index,'video',url,'user');
          quill.getSelection(range.index + 1)
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


    checkIsmore = () =>{
      //1. src체크 -> image든 video든 여러개면 x
      if(document.querySelectorAll("#ql").length>1){
        return true;
      }
      //2. text체크 -> 에디터 스크롤 height 이용?
      const height = document.querySelector(".ql-editor").scrollHeight;
      if(height>600){
        return true;
      }
      return false;
    }

    //blob to file list, name-> src 정해서
    submit = () => async (e) =>{
      e.preventDefault();
      var title = this.titleRef.current.value
      if(isEmpty(title)){
        this.setState({
          titleErr:["제목을 작성해주세요."]
        })
        return
      }
      var content = document.querySelector(".ql-editor").innerHTML
      const filePath = "/"+getToday()+"/"+this.mediaDir+"/"
      // path = /240/path.jpg
      let data = new FormData();
      //썸네일 만들지 여부
      const isMore = this.checkIsmore();
      data.append('more',isMore)
      const mediaElem = document.querySelector("#ql")
      //썸네일은 0.5배로 min height 240 max height 500
      //썸네일 저장소는 사이즈로 구분안되기 때문에 thumb/...로 변경
      if(isMore && mediaElem!==null){
        const newPath = filePath+getRandomGenerator(10)
        const ResizedFilePath = newPath+"thumb.jpg";
        const tag = mediaElem.tagName
        if(tag==="IMG"){
          //이미지는 원본 보내고 썸네일도 보내야함
          //리사이징 이미지는 jpg파일로
          let blob;
          if(mediaElem.src.startsWith('blob')){
            blob = await fetch(mediaElem.src).then(r=>r.blob())
              
          }else if(mediaElem.src.startsWith('data')){
            blob = await dataUrltoBlob(mediaElem.src)
          }
          const OriginalFilePath = newPath+"."+blob.type.split("/")[1]
          mediaElem.setAttribute("src","/api/file/get?name="+OriginalFilePath)
          this.saveFile(blob,OriginalFilePath,false,"THUMBNAIL")
          ResizeThumbnailImage(blob).then(resizedImage=>{
            this.saveFile(resizedImage,ResizedFilePath,false,"THUMBNAIL")
          })
          data.append("thumbnailImg","/api/file/get?name="+ResizedFilePath);
        }else if(tag==="VIDEO"){
          //비디오는 원본 보낼시 리사이징 백엔드에서 완료
          //thumbnailImg만 원본FileOriginName+thumb.jpg
          await fetch(mediaElem.src).then(r=>r.blob()).then(blob=>{
            const OriginalFilePath = newPath+"."+blob.type.split("/")[1]
            mediaElem.setAttribute("src","/api/file/get?name="+OriginalFilePath)
            if(mediaElem.videoWidth>0){
              this.saveFile(blob,OriginalFilePath,false,"THUMBNAIL")
            }else{
              this.saveFile(blob,OriginalFilePath,true,"THUMBNAIL")
            }
          })
          data.append("thumbnailImg","/api/file/get?name="+ResizedFilePath);
        }else if(tag==="IFRAME"){
          //youtube => https://img.youtube.com/vi/<insert-youtube-video-id-here>/sddefault.jpg
          const youtubePattern = /.*\/([^?.]*)\?.*/g
          const src = mediaElem.getAttribute("src");
          const Id = youtubePattern.exec(src)
          if(Id.length>0){
            const thumbNailSrc = `https://img.youtube.com/vi/${Id[1]}/sddefault.jpg`
            data.append("thumbnailImg",thumbNailSrc);
          }
        }
      }
      
      // NEED UPDATE : querySelector -> ref 사용 추천
      for(const elem of document.querySelectorAll(".ql-prevideo")){
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
            blob=>{
              const newPath = filePath+getRandomGenerator(10)+"."+blob.type.split("/")[1]
              video.setAttribute("src", "/api/file/get?name="+newPath)
              if(video.videoWidth>0){
                this.saveFile(blob,newPath,false)
              }else{
                this.saveFile(blob,newPath,true)
              }
            }
          )
        }
      }
      for(const elem of document.querySelectorAll(".image_preview")){
        elem.removeAttribute("class")
        const src = elem.src
        if(src.startsWith("blob")){
          await fetch(src).then(r=>r.blob()).then(
            blob=>{
              const newPath = filePath+getRandomGenerator(10)+"."+blob.type.split("/")[1]
              elem.setAttribute("src", "/api/file/get?name="+newPath)
              this.saveFile(blob,newPath,false)
            }
          )
        }else if(src.startsWith("data")){
          const blob = dataUrltoBlob(src);
          const newPath = filePath+getRandomGenerator(10)+"."+blob.type.split("/")[1]
          elem.setAttribute("src", "/api/file/get?name="+newPath)
          this.saveFile(blob,newPath,false)
        }
      }
      content = this.quillRef.props.value
      if (this.mediaFileSend || document.querySelector("#ql") !=null ){
        data.append('title',title)
        data.append('content',content)
        data.append('mediaDir',this.mediaDir)
        Axios.post("/board/upload",data).then(res =>{
          if (res.status ===200){
            this.props.history.push("/boards");
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

    saveFile = (file,path,needConvert,mediaType="BOARD") => {
      this.mediaFileSend = true
      const formData = new FormData();
      formData.append('file',file);
      formData.append('path',path);
      formData.append('needConvert',needConvert)
      formData.append("mediaType",mediaType)
      Axios.post("/file/upload",formData,{
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
              quill.insertEmbed(range.index+range.length,"myvideo",data,'user');
              quill.setSelection(range.index + 1);
              quill.focus();
            }
            return reader.readAsDataURL(_file);
          }else{
            reader.onload = (e) =>{
              const dataURL = e.target.result;
              const blob = dataUrltoBlob(dataURL)
              quill.insertEmbed(range.index+range.length,"image",blob);
              quill.setSelection(range.index + 1);
              quill.focus();
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
      "image",
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