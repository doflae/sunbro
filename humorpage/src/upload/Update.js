import ReactQuill from "react-quill"
import React,{Component,createRef} from "react"
import Dropzone from "react-dropzone"
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import {boardWrapper} from "../board/BoardWrapper"
import Axios from "axios"
import {getToday, 
  getRandomGenerator,
  isEmpty, 
  ResizeThumbnailImage, 
  sanitizeUrl,
  dataUrltoBlob} from "../utils/Utils"
import { ValidationError } from "../forms/ValidationError"

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
      this.props.request("get",`/board/simple/${this.props.match.params.key}`)
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

    

    checkIsmore = () =>{
      //1. src체크 -> image든 video든 여러개면 x
      if(document.querySelectorAll("#ql").length>1){
        return true;
      }
      //2. text체크 -> 에디터 스크롤 height 이용?
      const height = document.querySelector(".ql-editor").scrollHeight;
      if(height>700){
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
      const filePath = "/"+getToday()+"/"+this.boardDetail.mediaDir+"/"
      // path = /240/path.jpg
      const isMore = this.checkIsmore();
      const elem = document.querySelector("#ql")
      //썸네일은 0.5배로 min height 240 max height 500
      //썸네일 저장소는 사이즈로 구분안되기 때문에 thumb/...로 변경
      if(isMore && elem!==null){
        const src = elem.getAttribute('src');
        if(!src.startsWith("/file")){
          const newPath = filePath+getRandomGenerator(10)
          const ResizedFilePath = newPath+"thumb.jpg";
          if(elem.tagName==="IMG"){
            //이미지는 원본 보내고 썸네일도 보내야함
            //리사이징 이미지는 jpg파일로
            await fetch(elem.src).then(r=>r.blob()).then(blob=>{
              const OriginalFilePath = newPath+"."+blob.type.split("/")[1]
              elem.setAttribute("src","/file/get?name="+OriginalFilePath)
              this.saveFile(blob,OriginalFilePath,false,"THUMBNAIL")
              ResizeThumbnailImage(blob).then(resizedImage=>{
                this.saveFile(resizedImage,ResizedFilePath,false,"THUMBNAIL")
              })
            })
          }else{
            //비디오는 원본 보낼시 리사이징 백엔드에서 완료
            //thumbnailImg만 원본FileOriginName+thumb.jpg
            await fetch(elem.src).then(r=>r.blob()).then(blob=>{
              const OriginalFilePath = newPath+"."+blob.type.split("/")[1]
              elem.setAttribute("src","/file/get?name="+OriginalFilePath)
              if(elem.videoWidth>0){
                this.saveFile(blob,OriginalFilePath,false,"THUMBNAIL")
              }else{
                this.saveFile(blob,OriginalFilePath,true,"THUMBNAIL")
              }
            })
          }
          this.boardDetail.thumbnailImg = "/file/get?name="+ResizedFilePath;
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
              video.setAttribute("src", "/file/get?name="+newPath)
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
              elem.setAttribute("src", "/file/get?name="+newPath)
              this.saveFile(blob,newPath,false)
            }
          )
        }else if(src.startsWith("data")){
          const blob = dataUrltoBlob(src);
          const newPath = filePath+getRandomGenerator(10)+"."+blob.type.split("/")[1]
          elem.setAttribute("src", "/file/get?name="+newPath)
          this.saveFile(blob,newPath,false)
        }
      }
      content = document.querySelector(".ql-editor").innerHTML
      if (document.querySelector("#ql")!=null){
        const data = new FormData();
        data.append('title',title)
        data.append('content',content)
        data.append('more',isMore)
        data.append('thumbnailImg',this.boardDetail.thumbnailImg)
        data.append('id',this.boardDetail.id)
        data.append('mediaDir',this.boardDetail.mediaDir)

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
              var byteString = atob(dataURL.split(',')[1]);

              var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]

              var ab = new ArrayBuffer(byteString.length);
              var ia = new Uint8Array(ab);
              for (var i = 0; i < byteString.length; i++) {
                ia[i] = byteString.charCodeAt(i);
              }

              var blob = new Blob([ab], {type: mimeString});
              const data = {blob:blob,name:_file.name}
              quill.insertEmbed(range.index,"video",data);
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
              quill.insertEmbed(range.index,"image",blob);
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
    render() {
      return (
        <div className="main-panel">
          <div className="editor_navbar">
            <input type="text" className="editor_title" ref={this.titleRef} onChange={e=>{e.preventDefault(); this.onChangeTitle(e.target.value)}}></input>
            <ValidationError errors={this.state.titleErr}/>
          </div>
          <div className="main-content">
          <ReactQuill
            ref={(el)=>(this.quillRef = el)}
            value={this.state.contents}
            onChange={this.onChangeContents}
            theme="snow"
            modules={this.modules}
            formats={this.formats}
            onload={()=>{console.log('hi')}}
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
        </div>
          <div className="submitbar">
            <button type="submit" onClick={this.submit()} className="editor_submit">저장</button>
          </div>
        </div>
      )
    }
  }
export default boardWrapper(authWrapper(withRouter(Update)));