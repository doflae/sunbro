import ReactQuill from "react-quill"
import React,{Component,createRef} from "react"
import Dropzone from "react-dropzone"
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import {boardWrapper} from "../board/BoardWrapper"
import {uploadWrapper} from "./UploadWrapper"
import Axios from "axios"
import {
  getRandomGenerator,
  isEmpty, 
  ResizeThumbnailImage, 
  sanitizeUrl,
  dataUrltoBlob} from "../utils/Utils"
import { ValidationError } from "../forms/ValidationError"
import * as Styled from "./Styled";
const __ISMSIE__ = navigator.userAgent.match(/Trident/i) ? true : false;


class Update extends Component {
    constructor(props) {
        super(props)
        this.state = {
            contents: __ISMSIE__ ? "<p>&nbsp;</p>" : "",
            open:"image/*",
            titleErr:null,
            contentErr:null,
            boardDetail:props.boardDetail
        };  
        
        this.quillRef = null;
        this.dropzone = null;
        this.boardDetail = props.boardDetail;
        this.titleRef = createRef();
    }

    componentDidMount(){
      const quill = this.quillRef.getEditor();
      const tooltip = quill.theme.tooltip;
      const bgTarget = this.props.bgRef.current
      if(bgTarget){
        bgTarget.addEventListener('click',this.hiddenPage());
      }
      quill.clipboard.addMatcher("DIV",(node,delta)=>{
        delta.insert({'myvideo':node.firstElementChild.getAttribute('src')})
        return delta;
      })
      tooltip.save = () =>{
        const url = sanitizeUrl(tooltip.textbox.value)
        if(url!=null) {
          const range = tooltip.quill.selection.savedRange
          quill.insertEmbed(range.index,'video',url,'user');
          quill.getSelection(range.index + 1)
          quill.focus();
        }
        tooltip.hide();
      }
      this.getBoardDetail();
    }

    componentDidUpdate(prevProps){
      if(this.props.boardKey!==prevProps.boardKey){
        this.getBoardDetail();
      }
    }

    getBoardDetail = () =>{
      const quill = this.quillRef.getEditor();
      this.props.request("get",`/board/simple/${this.props.boardKey}`)
      .then(res=>{
          if(res.status===200 && res.data.success){
              this.titleRef.current.value = res.data.data.title
              this.boardDetail = res.data.data
              quill.clipboard.dangerouslyPasteHTML(this.boardDetail.content)
          }else{
              alert("해당 글의 작성자가 아닙니다.")
              this.props.history.goBack();
          }
      })
    }

    sendVideo = (filePath,elementList) =>{
      if(elementList==null) return
      elementList.forEach(elem=>{
        if(elem.childElementCount>1) elem.removeChild(elem.lastChild)
        elem.removeAttribute("src")
        elem.removeAttribute("style")
        elem.removeAttribute("class")
        elem.setAttribute("class","board_video");
        const video = elem.firstElementChild
        video.removeAttribute("class")
        video.setAttribute("controls","true")
        
        if(video.src.startsWith("blob")){
          fetch(video.src).then(r=>r.blob()).then(
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
      })
    }

    sendImage = (filePath,elementList) =>{
      if(elementList==null) return
      elementList.forEach(elem=>{
        elem.removeAttribute("class")
        const src = elem.src
        if(src.startsWith("blob")){
          fetch(src).then(r=>r.blob()).then(
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
      })
    }

    removeId = (elementList) =>{
      if(elementList==null) return
      elementList.forEach(elem=>{
        elem.removeAttribute("id")
      })
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
          if(Id!=null){
            const thumbNailSrc = `https://img.youtube.com/vi/${Id[1]}/sddefault.jpg`
            data.append("thumbnailImg",thumbNailSrc);
          }
        }
      }
      
      // NEED UPDATE : querySelector -> ref 사용 추천
      await this.sendVideo(filePath,document.querySelectorAll(".ql-prevideo"))
      await this.sendImage(filePath,document.querySelectorAll(".image_preview"))
      const mediaElems = document.querySelectorAll("#ql")
      await this.removeId(mediaElems)
      const content = this.quillRef.props.value
      if (this.mediaFileSend || mediaElems!==null){
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
              var byteString = atob(dataURL.split(',')[1]);

              var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]

              var ab = new ArrayBuffer(byteString.length);
              var ia = new Uint8Array(ab);
              for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }

              var blob = new Blob([ab], {type: mimeString});
              const data = {blob:blob,name:_file.name}
              quill.insertEmbed(range.index+range.length,"myvideo",data);
              quill.setSelection(range.index + 1);
              quill.focus();
            }
            return reader.readAsDataURL(_file);
          }else{
            reader.onload = (e) =>{
              const dataURL = e.target.result;
              var byteString = atob(dataURL.split(',')[1]);

              var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]

              var ab = new ArrayBuffer(byteString.length);
              var ia = new Uint8Array(ab);
              for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }

              var blob = new Blob([ab], {type: mimeString});
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
      clipboard: {
        matchVisual: false,
       }
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
    const bgTarget = this.props.updatePageRef.current
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
export default uploadWrapper(boardWrapper(authWrapper(withRouter(Update))));