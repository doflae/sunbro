import ReactQuill from "react-quill"
import React,{Component} from "react"
import Dropzone from "react-dropzone"
import { uploadFile } from "./UploadFile";
import { uploadComment} from "./UploadComment";
const __ISMSIE__ = navigator.userAgent.match(/Trident/i) ? true : false;
const __ISIOS__ = navigator.userAgent.match(/iPad|iPhone|iPod/i) ? true : false;

class CommentEditor extends Component {
    constructor(props) {
      super(props)
      this.state = {
        subject: "",
        contents: __ISMSIE__ ? "<p>&nbsp;</p>" : "",
        workings: {},
        fileIds: []
      };
    }
    quillRef = null;
    dropzone = null;
    onKeyEvent = false;
    componentDidMount(){
      document.querySelector(".ql-mycustom").innerHTML='<svg viewBox="0 0 18 18"> <rect class="ql-stroke" height="12" width="12" x="3" y="3"></rect> <rect class="ql-fill" height="12" width="1" x="5" y="3"></rect> <rect class="ql-fill" height="12" width="1" x="12" y="3"></rect> <rect class="ql-fill" height="2" width="8" x="5" y="8"></rect> <rect class="ql-fill" height="1" width="3" x="3" y="5"></rect> <rect class="ql-fill" height="1" width="3" x="3" y="7"></rect> <rect class="ql-fill" height="1" width="3" x="3" y="10"></rect> <rect class="ql-fill" height="1" width="3" x="3" y="12"></rect> <rect class="ql-fill" height="1" width="3" x="12" y="5"></rect> <rect class="ql-fill" height="1" width="3" x="12" y="7"></rect> <rect class="ql-fill" height="1" width="3" x="12" y="10"></rect> <rect class="ql-fill" height="1" width="3" x="12" y="12"></rect> </svg>'
      document.querySelector(".ql-video").innerHTML='<svg height="18pt" viewBox="-21 -117 682.66672 682" width="18pt" xmlns="http://www.w3.org/2000/svg"><path d="m626.8125 64.035156c-7.375-27.417968-28.992188-49.03125-56.40625-56.414062-50.082031-13.703125-250.414062-13.703125-250.414062-13.703125s-200.324219 0-250.40625 13.183593c-26.886719 7.375-49.03125 29.519532-56.40625 56.933594-13.179688 50.078125-13.179688 153.933594-13.179688 153.933594s0 104.378906 13.179688 153.933594c7.382812 27.414062 28.992187 49.027344 56.410156 56.410156 50.605468 13.707031 250.410156 13.707031 250.410156 13.707031s200.324219 0 250.40625-13.183593c27.417969-7.378907 49.03125-28.992188 56.414062-56.40625 13.175782-50.082032 13.175782-153.933594 13.175782-153.933594s.527344-104.382813-13.183594-154.460938zm-370.601562 249.878906v-191.890624l166.585937 95.945312zm0 0"/></svg>'
    }
    onDrop = async (acceptedFiles) => {
      try {
        await acceptedFiles.reduce((pacc, _file, i) => {
          if (_file.type.split("/")[0]==="image"){
            return pacc.then(async () => {
              await this.saveFile(_file).then((res)=>{
                const quill = this.quillRef.getEditor();
                const range = quill.getSelection();
                quill.insertEmbed(range.index, "image", "/images/"+res.data);
                quill.setSelection(range.index + 1);
                quill.focus();
              });
            });
          }else{
            return pacc.then(async () => {
              await this.saveFile(_file).then((res)=>{
                const quill = this.quillRef.getEditor();
                const range = quill.getSelection();
                console.log("video");
                quill.insertEmbed(range.index, "video", "/videos/"+res.data);
                quill.setSelection(range.index + 1);
                quill.focus();
              });
            });
          }
        }, Promise.resolve());
      } catch (error) {}
    };
    imageHandler = () => {
      if (this.dropzone) this.dropzone.open();
    };
  
    modules = {
      toolbar: {
        container: [
          ["link", "image", "mycustom","video"]
        ],
        handlers: { image: this.imageHandler,
          mycustom: this.imageHandler
        }
      },
      clipboard: { matchVisual: false }
    };
  
    formats = [
      "link",
      "image",
      "video",
      "align"
    ];
    //IOS ISSUE, IE ISSUE

    onKeyUp = (e)=>{
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
                accept = "image/*,video/*"
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
        )
    }
  }
export default CommentEditor;