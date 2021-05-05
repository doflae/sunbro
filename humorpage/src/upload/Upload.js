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

Math.ceil10 = (value,exp) =>{
  if (typeof exp === 'undefined' || +exp === 0) {
    return Math['ceil'](value);
  }
  value = +value;
  exp = +exp;
  // If the value is not a number or the exp is not an integer...
  if (isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
    return NaN;
  }
  value = value.toString().split('e');
  value = Math['ceil'](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
  // Shift back
  value = value.toString().split('e');
  return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}


const __ISMSIE__ = navigator.userAgent.match(/Trident/i) ? true : false;

const Video = Quill.import('formats/video');
const IMG = Quill.import('formats/image');
const BlockEmbed = Quill.import('blots/block/embed');
const youtubePattern = /https:\/\/www\.youtube\.com\/embed\/([^?.]*)\?.*/g

class MediaBlot extends BlockEmbed{
    static create(value){
        const node = super.create();
        const div = document.createElement("div")
        div.className="boardIframeZone";
        div.setAttribute('id',"ql");
        node.className="boardIframe";
        node.setAttribute('frameborder', '0');
        node.setAttribute('allow', 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture');
        node.setAttribute('allowtransparency', true);
        node.setAttribute('allowfullscreen', true);
        node.setAttribute('scrolling', '0');
        node.setAttribute('src',value);
        div.appendChild(node);
        div.send = async (filePath,data=null,isThumb=false) =>{
          div.removeAttribute('id')
          if(isThumb){
            const src = mediaElem.getAttribute("src");
            const Id = youtubePattern.exec(src)
            const img = new Image()
            const thumb = document.createElement("div")
            thumb.className="ng-div-center"
            if(Id){
              img.src = `https://img.youtube.com/vi/${Id[1]}/sddefault.jpg`
              const logo = new Image()
              logo.src = "/api/file/get?name=/youtubelogo.png"
              logo.className = "youtube-logo"
              thumb.appendChild(img)
              thumb.appendChild(logo)
              thumb.setAttribute("style","aspect-ratio:1.334;max-width:640px;")
            }else{
              img.src="/api/file/get?name=/twitchlogo.jpg"
              thumb.setAttribute("style","aspect-ratio:1.5;max-width:600px;")
              thumb.appendChild(img)
            }
            data.append("thumbnail",thumb.outerHTML);
          }
        }
        return div;
    }

    static sanitize(url){
      return sanitizeUrl(url);
    }

    static value(node){
      return node.getAttribute('src');
    }
}

MediaBlot.blotName = "myiframe";
MediaBlot.tagName = "iframe";
Quill.register("formats/myiframe",MediaBlot,false);

class CustomImage extends IMG{
  static create(value){
    const node = document.createElement('div')
    const image = new Image();
    image.src = this.getUrl(value)
    this.getSmUrl(node, value)
    image.onload = () => {
      const ratio = (image.naturalWidth/image.naturalHeight).toFixed(5)
      node.setAttribute("style",`max-width:${image.naturalWidth}px;aspect-ratio:${Math.ceil10(ratio,-4)};`)
      node.className="ql-img-div"
    }
    node.appendChild(image)
    node.setAttribute("id","ql")
    node.classList.add("image-preview")
    node.send = async (filePath,data=null,isThumb=false) =>{
      //check 1. isThumb => 원본, 썸네일용, lazy load용
      //      2. 이미 저장된 파일인지=>startsWith("/file")
      node.removeAttribute('id')
      let blob = await fetch(image.src).then(r=>r.blob())
      const fileName = getRandomGenerator(10)
      const newPath = filePath+fileName
      if(image.src.startsWith("blob")){
        const OriginalFilePath = newPath+"."+blob.type.split("/")[1]
        image.className = "ng-img-small"
        node.className = "ng-img-div"
        const dataset = node.dataset
        image.src = "/api/file/get?name="+OriginalFilePath
        this.save(blob,OriginalFilePath)
        await fetch(dataset.small).then(r=>r.blob()).then(
          blob=>{
            const newPath = "/27"+OriginalFilePath
            node.dataset.small = "/api/file/get?name="+newPath
            this.save(blob,newPath)
          }
        )
        if(isThumb){
          const thumbFilePath = newPath+"thumb.jpg";
          ResizeThumbnailImage(blob).then(resizedImage=>{
            this.save(resizedImage,thumbFilePath)
          })
          const temp = image.getAttribute("src")
          node.dataset.lg = "/api/file/get?name="+thumbFilePath
          image.src = node.dataset.small
          data.append("thumbnail",node.outerHTML);
          node.dataset.lg = temp;
        }else{
          node.dataset.lg = image.getAttribute("src")
        }
      }else{
        if(isThumb){
          const thumbFilePath = newPath+"thumb.jpg"
          ResizeThumbnailImage(blob).then(resizedImage=>{
            this.save(resizedImage,thumbFilePath)
          })
          const temp = image.getAttribute("src")
          node.dataset.lg = "/api/file/get?name="+thumbFilePath
          image.src = node.dataset.small
          data.append("thumbnail",node.outerHTML);
          node.dataset.lg = temp;
        }
      }
    }
    return node
  }

  static save = (file,path,mediaType="BOARD") => {
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
    node.setAttribute("id","ql")
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
    node.send = async (filePath,data=null,isThumb=false) =>{
      node.removeAttribute("id")
      if(node.childElementCount>1) node.removeChild(temp)
      const fileName = getRandomGenerator(10)
      const newPath = filePath+fileName
      if(video.src.startsWith("blob")){
        let blob = await fetch(video.src).then(r=>r.blob())
        const thumbFilePath = newPath+"thumb.jpg";
        const OriginalFilePath = newPath+"/"+fileName+".m3u8"
        node.dataset.url = "/api/file/get?name="+OriginalFilePath
        await this.save(node,blob,OriginalFilePath,thumbFilePath)
        if(isThumb){
          data.append("thumbnail",node.outerHTML)
        }
      }else{
        if(isThumb){
          data.append("thumbnail",node.outerHTML)
        }
      }
    }
    return node
  }

  static save = async(node,file,path,thumbPath) =>{
    const formData = new FormData();
    formData.append('file',file);
    formData.append('path',path);
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
        node.setAttribute("style",`max-width:${ratio[0]}px;aspect-ratio:${Math.ceil10(ratio[0]/ratio[1],-4)}`)
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


//TODO : sendImage, sendVideo node에 내장 => update와 중복 코드 제거
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
          quill.insertEmbed(range.index,'myiframe',url,'user');
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
        mediaElem.send(filePath,data,true)
      }
      const mediaElems = this.quill.querySelectorAll("#ql")
      const queries = Object.values(mediaElems).map(async media=> await media.send(filePath))
      await Promise.all(queries)
      const content = this.quill.innerHTML
      if (this.mediaFileSend || mediaElem!==null){
        const user = this.props.user
        data.append('authorName',user.name)
        data.append('authorNum',user.userNum)
        data.append("authorImg",user.userImg?user.userImg:"")
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
      "myiframe",
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

  hiddenPage = () =>{
    const bgTarget = this.props.uploadPageRef.current
    if(bgTarget) bgTarget.style.display = "none";
  }

  render() {
    return (
      <Styled.UploadBoxStyled>
        <Styled.DeleteBtnStyled onClick={this.hiddenPage}/>
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