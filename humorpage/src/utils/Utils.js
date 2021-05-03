import sanitizeHtml from "sanitize-html-react"
import React from "react"

export const sanitizeNonNull = (dirty) => dirty==null?"":sanitize(dirty);
    
export const sanitize = (dirty) => sanitizeHtml(dirty,{
    allowedTags: [
        "address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4",
        "h5", "h6", "hgroup", "main", "nav", "section", "blockquote", "dd", "div",
        "dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
        "ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
        "em", "i","iframe", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp",
        "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "caption",
        "col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr","img","video"
      ],
      disallowedTagsMode: 'discard',
      allowedAttributes: {
        a: [ 'href', 'name', 'target', 'class' ],
        div: ['class','frameborder','allowfullscreen'],
        img: ['src','class','style'],
        video:['src','controls','type','style','class','tabindex','controlsList'],
        iframe:['*'],
      },
      selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
      allowedSchemes: [ 'http', 'https', 'ftp', 'mailto', 'tel' ],
      allowedSchemesByTag: {},
      allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
      allowProtocolRelative: true,
      enforceHtmlBoundary: false
})

export const isEmpty = (st) => {
    return (st == null ||st.length === 0 || !st.trim());
}

export const splitCname = (content) =>{
    const r = content.match(/<span[^>]*>@([^<]*)<\/span>/)
    if(r) return {cname:r[1],content:content.slice(r[0].length)}
    return {cname:null,content:content}
}

export const sanitizeHarder = (dirty) => sanitizeHtml(dirty,{
    allowedTags:[
        "p","span","img"
    ],
    disallowedTagsMode: 'discard',
    allowedAttributes: {
      a: [ 'href', 'name', 'target', 'class' ],
      span: ['class'],
      // We don't currently allow img itself by default, but this
      // would make sense if we did. You could add srcset here,
      // and if you do the URL is checked for safety
      img: ['src','class','style'],
    },
    // Lots of these won't come up by default because we don't allow them
    selfClosing: [ 'img', 'br', 'hr', 'area', 'base', 'basefont', 'input', 'link', 'meta' ],
    // URL schemes we permit
    allowedSchemes: [ 'http', 'https', 'ftp', 'mailto', 'tel' ],
    allowedSchemesByTag: {},
    allowedSchemesAppliedToAttributes: [ 'href', 'src', 'cite' ],
    allowProtocolRelative: true,
    enforceHtmlBoundary: false
})

export const sanitizeUrl = (url) =>{
    if(typeof(url)!="string") return null;
    const youtubeMatch = url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtube\.com\/watch.*v=([a-zA-Z0-9_-]+)/) ||
                url.match(/^(?:(https?):\/\/)?(?:(?:www|m)\.)?youtu\.be\/([a-zA-Z0-9_-]+)/) ||
                url.match(/^.*(youtu.be\/|v\/|e\/|u\/\w+\/|embed\/|v=)([^#&?]*).*/);
    if (youtubeMatch && youtubeMatch[2].length === 11) {
        return `https://www.youtube.com/embed/${youtubeMatch[2]}?showinfo=0`
    }
    const twitchMatch = url.match(/^(?:(https?):\/\/)?(?:www\.)?twitch\.tv\/videos\/(\d+)/)||
                url.match(/^(?:(https?):\/\/)?(?:www\.)?player\.twitch\.tv\/\?video\=(\d+).*/)
    if (twitchMatch) {
        return `https://player.twitch.tv/?video=${twitchMatch[2]}&parent=127.0.0.1&autoplay=false`
    }
    return null;
}

export const getDate = (datetime) =>{
    return datetime.replaceAll("-",".").split("T")[0]
}

export const changeDateTimeToPath = (datetime) =>{
    return "/"+datetime.split("T")[0].replaceAll("-","/")+"/"
}

export const getTime = (datetime) =>{
    if(datetime==null) return null
    let t = parseInt((Date.now() - Date.parse(datetime))/1000)
    if(t<60){
        return "방금 전"
    }else if(t<3600){
        return `${parseInt(t/60)}분 전`
    }else if(t<86400){
        return `${parseInt(t/3600)}시간 전`
    }else{
        return datetime.replaceAll("-",".").replace("T"," ")
    }
}

export const convertUnitOfNum = (num) =>{
    if(num==null) return null
    if(num<1000) return num
    else if(num<10000) return `${(num/1000).toFixed(1)} K`
    else if(num<1000000) return `${(num/10000).toFixed(1)} M`
    else return `${(num/1000000).toFixed(2)} B`
}

export const AgeSelector = () =>{
    const ages = []
    for(let t = 0;t<10;t++){
        ages.push(t*10)
    }
    
    return ages.map((age,index)=><option key={index} value={age}>{age}~{age+9}</option>)
}

export const getToday = () =>{
    let today = new Date();   

    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1;  // 월
    let day = today.getDate();  // 날짜
    if (month < 10) 
        month = '0' + month;
    if (day < 10) 
        day = '0' + day;

    return year + '/' + month + '/' + day
}

const sampleString = "1234567890qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM"
export const getRandomGenerator = (length) =>{
    let ret = ""
    for(let i = 0; i<length;i++){
        ret+=sampleString[Math.floor(Math.random()*sampleString.length)]
    }
    return ret
}


export const dataUrltoBlob = (dataURL) =>{
    var byteString = atob(dataURL.split(',')[1]);

    var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]

    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ab], {type: mimeString});
}


//input file or dataUrl
//return Promise=>resizedImage(blob data)
export const ResizeImage = (data, maxSize=474) =>{
    const fileReader = new FileReader();
    var canvas = document.createElement("canvas");
    var image = new Image();
    var resize = () => {
        var width = image.width;
        var height = image.height;
        if(width>height){
            height *= maxSize / width;
            width = maxSize;
        }else{
            width *= maxSize / height;
            height = maxSize;
        }
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(image,0,0,width,height);
        var dataUrl = canvas.toDataURL(data.type);
        return dataUrltoBlob(dataUrl);
    }
    return new Promise(function(ok, no){
        if(data.type && !data.type.match(/image.*/)){
            no(new Error("Not an Image"))
            return;
        }
        if(typeof(data)==="string"){
            var mimeString = data.split(',')[0].split(':')[1].split(';')[0]
            if(mimeString.match(/image.gif/)){
                return ok(dataUrltoBlob(data))
            }
            image.onload = () => ok(resize())
            image.src=data
        }
        else{
            fileReader.onload = (readerEvent) =>{
                if(data.type.match(/image.gif/)){
                    //gif 파일은 리사이즈 못하고 blob으로 변경
                    image.onload = () => ok(dataUrltoBlob(readerEvent.target.result))
                }else{
                    image.onload = () => ok(resize());
                }
                image.src = readerEvent.target.result;
            };
            fileReader.readAsDataURL(data);
        }
    })
}


//return Promise=>resizedImage(jpeg type blob data)
export const ResizeThumbnailImage = (data)=>{
    const fileReader = new FileReader();
    var canvas = document.createElement("canvas");
    var image = new Image();
    var resize = () => {
        var width = image.width;
        var height = image.height;
        var maxSize = Math.max(width,height);
        var scale = 1
        if(maxSize>1000){
            scale = 500 / maxSize
        }
        else if(maxSize>500){
            scale = 0.5
        }
        canvas.width = width * scale;
        canvas.height = height * scale;
        canvas.getContext('2d').drawImage(image,0,0,canvas.width,canvas.height);
        var dataUrl = canvas.toDataURL("image/jpeg");
        return dataUrltoBlob(dataUrl);
    }

    return new Promise(function(ok){
        fileReader.onload = (readerEvent) =>{
            image.onload = () => ok(resize());
            image.src = readerEvent.target.result;
        };
        fileReader.readAsDataURL(data);
    })
}

export const copyToClipboard = (text) =>{
    if (window.clipboardData && window.clipboardData.setData) {
        return window.clipboardData.setData("Text", text); 

    } else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");
        } catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        } finally {
            document.body.removeChild(textarea);
        }
    }
}

export const throttle = (fn, delay=100) =>{
    var timer = null;
    return ()=>{
        var context = this;
        var args = arguments;
        if(!timer){
            timer = setTimeout(()=>{
                fn.apply(context,args);
                timer = null;
            },delay);
        }
    }
}

export const debounce = (fn,delay=1000) =>{
    var timer = null;
    return ()=>{
        var context = this;
        var args = arguments;
        clearTimeout(timer);
        timer = setTimeout(()=>{
            fn.apply(context,args);
        },delay);
    }
}
