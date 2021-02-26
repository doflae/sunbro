import ReactQuill, {Quill} from "react-quill"
import React,{Component} from "react"
import Dropzone from "react-dropzone"
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
const __ISMSIE__ = navigator.userAgent.match(/Trident/i) ? true : false;
const __ISIOS__ = navigator.userAgent.match(/iPad|iPhone|iPod/i) ? true : false;

const Video = Quill.import('formats/video');
const Link = Quill.import("formats/link");
const Image = Quill.import('formats/image');

class CustomImage extends Image{
  static create(value){
    const image = document.createElement('img')
    image.src = this.sanitize(value)
    image.setAttribute("style","max-height:100%;max-width:100%;")
    return image
  }
  static sanitize(url){
    return Link.sanitize(url)
  }
}

CustomImage.blotName = 'image';

Quill.register("formats/myimage",CustomImage,false);

class CustomVideo extends Video{
  static create(value){
    const node = super.create();
    const video = document.createElement('div')
    const temp = document.createElement('div')
    const svg = document.createElementNS("http://www.w3.org/2000/svg","svg");
    const path = document.createElementNS("http://www.w3.org/2000/svg","path")
    video.setAttribute('controls',true);
    video.setAttribute('type',"video/mp4");
    video.setAttribute('style',"max-height:100%;max-width:100%;postion:relative;");
    video.setAttribute('class',"video_preview");
    video.setAttribute('src',this.sanitize(value[0]));
    temp.setAttribute('class',"video_preview_tempData")
    node.style.backgroundColor = "#e8eae6"
    svg.setAttributeNS(null,"width","24pt")
    svg.setAttributeNS(null,"height","24pt")
    const url = document.createElement("div")
    url.setAttribute("class","video_preview_tempData_url")
    url.innerText = this.sanitize(value[1]);
    temp.appendChild(svg)
    temp.appendChild(url);
    svg.setAttributeNS(null,"viewBox","0 0 320.001 320.001")
    svg.setAttributeNS(null,"enable-background","new 0 0 320.001 320.001")
    svg.setAttributeNS(null,"style","display:block;margin:auto;")
    path.setAttributeNS(null,"d","m295.84 146.049-256-144c-4.96-2.784-11.008-2.72-15.904.128-4.928 2.88-7.936 8.128-7.936 13.824v288c0 5.696 3.008 10.944 7.936 13.824 2.496 1.44 5.28 2.176 8.064 2.176 2.688 0 5.408-.672 7.84-2.048l256-144c5.024-2.848 8.16-8.16 8.16-13.952s-3.136-11.104-8.16-13.952z")
    svg.appendChild(path)
    node.appendChild(video);
    node.appendChild(temp);
    return node
  }

  static sanitize(url){
    return Link.sanitize(url);
  }
};

CustomVideo.blotName = 'video';
CustomVideo.className = "ql-prevideo";
CustomVideo.tagName = "DIV";

Quill.register('formats/myvideo', CustomVideo,false);
class Editor extends Component {
    constructor(props) {
      super(props)
      this.state = {
        contents: __ISMSIE__ ? "<p>&nbsp;</p>" : "",
        thumbnailFile : null,
        open:"image/*",
      };
    }
    quillRef = null;
    dropzone = null;
    onKeyEvent = false;


    submit = () => (e) =>{
      e.preventDefault();
      var title = document.querySelector(".editor_title").value
      document.querySelectorAll(".ql-prevideo").forEach(function(elem){
        elem.removeChild(elem.lastChild)
        elem.removeAttribute("src")
        elem.removeAttribute("style")
        elem.firstElementChild.removeAttribute("class")
      });
      var content = document.querySelector(".ql-editor").innerHTML
      var real = document.querySelector(".ql-editor").innerText
      if (title!==null && (!this.isEmpty(real) || content.search("img")!==-1 || content.search("video")!==-1)){
        let data = new FormData();
        data.append('title',title)
        data.append('content',content)
        data.append('thumbnail',real.slice(0,100))
        this.props.request("post","/board/upload",data).then(res =>{
          if (res.status ===200){
            this.props.history.push("/boards");
            this.props.history.go();
          }else{
            console.log(res)
          }
        })
      }
    }
    isEmpty = (st) => {
      return st.length === 0 || !st.trim();
    }
    componentDidMount(){
      document.querySelector(".ql-mycustom").innerHTML='<svg viewBox="0 0 18 18"> <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect> <rect class="ql-fill" height="12" width="1" x="5" y="3"></rect> <rect class="ql-fill" height="12" width="1" x="12" y="3"></rect> <rect class="ql-fill" height="2" width="8" x="5" y="8"></rect> <rect class="ql-fill" height="1" width="3" x="3" y="5"></rect> <rect class="ql-fill" height="1" width="3" x="3" y="7"></rect> <rect class="ql-fill" height="1" width="3" x="3" y="10"></rect> <rect class="ql-fill" height="1" width="3" x="3" y="12"></rect> <rect class="ql-fill" height="1" width="3" x="12" y="5"></rect> <rect class="ql-fill" height="1" width="3" x="12" y="7"></rect> <rect class="ql-fill" height="1" width="3" x="12" y="10"></rect> <rect class="ql-fill" height="1" width="3" x="12" y="12"></rect> </svg>'
      document.querySelector(".ql-video").innerHTML='<svg height="18pt" viewBox="-21 -117 682.66672 682" width="18pt" xmlns="http://www.w3.org/2000/svg"><path d="m626.8125 64.035156c-7.375-27.417968-28.992188-49.03125-56.40625-56.414062-50.082031-13.703125-250.414062-13.703125-250.414062-13.703125s-200.324219 0-250.40625 13.183593c-26.886719 7.375-49.03125 29.519532-56.40625 56.933594-13.179688 50.078125-13.179688 153.933594-13.179688 153.933594s0 104.378906 13.179688 153.933594c7.382812 27.414062 28.992187 49.027344 56.410156 56.410156 50.605468 13.707031 250.410156 13.707031 250.410156 13.707031s200.324219 0 250.40625-13.183593c27.417969-7.378907 49.03125-28.992188 56.414062-56.40625 13.175782-50.082032 13.175782-153.933594 13.175782-153.933594s.527344-104.382813-13.183594-154.460938zm-370.601562 249.878906v-191.890624l166.585937 95.945312zm0 0"/></svg>'
    }


    saveFile = (file) => {
      const formData = new FormData();
      formData.append('file',file)
      return this.props.request("post","/file/upload",formData,{
        headers:{
          'Content-Type':'multipart/form-data',
        }
      })
      .then( res=> res.data)
    };
    
    onDrop = (acceptedFiles) => {
      try {
        acceptedFiles.reduce((pacc, _file) => {
          const quill = this.quillRef.getEditor();
          const range = quill.getSelection();
          if (_file.type.split("/")[0]==="video"){
            return pacc.then(() => {
              this.saveFile(_file)
              .then((res)=>{
                if(res.success===true){
                  if(this.state.thumbnailFile==null){
                    this.setState({
                      thumbnailFile:res.data.replace("/temp","")
                    })
                  }
                  quill.insertEmbed(range.index, "video", [res.data,_file.name]);
                  quill.setSelection(range.index + 1);
                  quill.focus();
                }else{
                  this.props.history.push("/login")
                }
              })
            }
            );
          }else{
            return pacc.then(() => {
              this.saveFile(_file)
              .then((res)=>{
                if(res.success===true){
                  if(this.state.thumbnailFile==null){
                    this.setState({
                      thumbnailFile:res.data.replace("/temp","")
                    })
                  }
                  quill.insertEmbed(range.index, "image", res.data);
                  quill.setSelection(range.index + 1);
                  quill.focus();
                }else{
                  this.props.history.push("/login")
                }
              });
            });
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
          ["bold", "italic", "underline", "strike", "blockquote"],
          [{ size: ["small", false, "large", "huge"] }, { color: [] }],
          [
            { list: "ordered" },
            { list: "bullet" },
            { indent: "-1" },
            { indent: "+1" },
            { align: [] }
          ],
          ["link", "image", "mycustom","video"]
        ],
        handlers: { image: this.imageHandler,
          mycustom: this.videoHandler
        }
      },
      clipboard: { matchVisual: false }
    };
  
    formats = [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "size",
      "color",
      "list",
      "bullet",
      "indent",
      "link",
      "image",
      "video",
      "align"
    ];
    //IOS ISSUE, IE ISSUE

    onKeyUp = (e) =>{
      if(!__ISIOS__) return;

      if(e.keyCode===13){
        this.onKeyEvent = true;
        this.quillRef.blur();
        this.quillRef.focus();
        if(document.querySelector(".main-content").className.indexOf("edit-focus")===-1){
          document.querySelector(".main-content").classList.toggle("edit-focus");
        }
        this.onKeyEvent = false;
      }
    };

    onFocus = () => {
      if (
        !this.onKeyEvent &&
        document.querySelector(".main-content").className.indexOf("edit-focus")=== -1
      ){
        document.querySelector(".main-content").classList.toggle("edit-focus");
        window.scrollTo(0,0);
      }
    };

    onBlur = () => {
      if (
        !this.onKeyEvent &&
        document.querySelector(".main-content").className.indexOf("edit-focus") !== -1
      ) {
        document.querySelector(".main-content").classList.toggle("edit-focus");
      }
    };

  doBlur = () => {
    this.onKeyEvent = false;
    this.quillRef.blur();
    // force clean
    if (document.querySelector(".main-content").className.indexOf("edit-focus") !== -1) {
      document.querySelector(".main-content").classList.toggle("edit-focus");
    }
  };

  onChangeContents = (contents) => {
    let _contents = null;
    if (__ISMSIE__) {
      if (contents.indexOf("<p><br></p>") > -1) {
        _contents = contents.replace(/<p><br><\/p>/gi, "<p>&nbsp;</p>");
      }
    }
    this.setState({ contents: _contents || contents });
  };
  
    render() {
      
      return (
        <div className="main-panel">
          <div className="editor_navbar">
            <input type="text" className="editor_title"></input>
          </div>
          <div className="main-content">
          <ReactQuill
            ref={(el)=>(this.quillRef = el)}
            value={this.state.contents}
            onChange={this.onChangeContents}
            onKeyUp={this.onKeyUp}
            onFocus={this.onFocus}
            onBlur={this.onBlur}
            theme="snow"
            modules={this.modules}
            formats={this.formats}
          />
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
export default authWrapper(withRouter(Editor));