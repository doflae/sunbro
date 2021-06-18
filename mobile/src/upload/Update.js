import ReactQuill, { Quill } from "react-quill"
import ReactDOM from "react-dom"
import React,{Component,createRef} from "react"
import Dropzone from "react-dropzone"
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import {boardWrapper} from "../board/BoardWrapper"
import {uploadWrapper} from "./UploadWrapper"
import Axios from "axios"
import {
  dataUrltoBlob,
  isEmpty,
  ResizeImage,
  sanitizeUrl} from "../utils/Utils"
import { ValidationError } from "../forms/ValidationError"
import * as Styled from "./Styled";
import ReactHlsPlayer from "react-hls-player";

const __ISMSIE__ = navigator.userAgent.match(/Trident/i) ? true : false;

const BlockEmbed = Quill.import('blots/block/embed');

class UpdateVideo extends BlockEmbed{
  static create(value){
    const node = super.create();
    const img = new Image();
    img.src = value.src;
    img.className="ng-thumb"
    node.className="ng-video"
    node.setAttribute("id","ql")
    node.dataset.url = value.url
    node.setAttribute("style",value.style)
    const playBtn = document.createElement("div")
    playBtn.className="playBtn-2"
    playBtn.onclick = () =>{
      playBtn.style.display="none";
      node.removeChild(img)
      ReactDOM.render(<ReactHlsPlayer
        src={node.dataset.url}
        autoPlay={true}
        controls={true}
        width="auto"
        height="auto"/>,node)
    }
    node.removeAttribute("src")
    node.appendChild(img)
    node.appendChild(playBtn)
    node.send = async (filePath,data,isThumb=false) =>{
      if(isThumb) data.append("thumbnail",node.outerHTML)
    }
    return node;
  }
  static value(node){
    if(node.className==="ng-video"){
      return {src:node.firstElementChild.getAttribute("src"),
      style:node.getAttribute("style"),
      url:node.dataset.url}
    }
    return null;
  }
}

UpdateVideo.blotName = "upvideo";
UpdateVideo.tagName = "div";
Quill.register("formats/upvideo",UpdateVideo,false);


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
        this.quill = null;
    }

    componentDidMount(){
      const quill = this.quillRef.getEditor();
      this.quill = quill.root     
      const tooltip = quill.theme.tooltip;
      tooltip.save = () =>{
        const url = sanitizeUrl(tooltip.textbox.value)
        if(url!=null) {
          const range = tooltip.quill.selection.savedRange
          quill.insertEmbed(range.index,'myiframe',url,'user');
          quill.setSelection(range.index + 1)
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
      this.props.request("get",`/board/get/${this.props.boardKey}`)
      .then(res=>{
          if(res.status===200 && res.data.success){
              this.titleRef.current.value = res.data.data.title
              this.boardDetail = res.data.data
              quill.clipboard.dangerouslyPasteHTML(this.boardDetail.content,'user')
          }else{
              alert("해당 글의 작성자가 아닙니다.")
              this.props.history.goBack();
          }
      })
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
      const filePath = this.boardDetail.mediaDir+"/"
      // path = /240/path.jpg
      let data = new FormData();
      //썸네일 만들지 여부
      const isMore = this.checkIsmore();
      data.append('more',isMore)
      const mediaElem = this.quill.querySelector("#ql")
      //썸네일은 0.5배로 min height 240 max height 500
      //썸네일 저장소는 사이즈로 구분안되기 때문에 thumb/...로 변경
      if(isMore && mediaElem!==null){
        await mediaElem.send(filePath,data,true)
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
        data.append('more',isMore)
        data.append('id',this.boardDetail.id)
        data.append('mediaDir',this.boardDetail.mediaDir)

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
              quill.setSelection(range.index + 1);
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
                quill.setSelection(range.index + 1);
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
      }
    };
  
    formats = [
      "myimage",
      "myiframe",
      "myvideo",
      "upvideo"
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
    const bgTarget = this.props.updatePageRef.current
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
export default uploadWrapper(boardWrapper(authWrapper(withRouter(Update))));