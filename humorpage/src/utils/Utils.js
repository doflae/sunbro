import sanitizeHtml from "sanitize-html-react"

export const sanitizeNonNull = (dirty) =>{
    const content = sanitize(dirty)
    return content==="null"?"":content;
}

export const sanitize = (dirty) => sanitizeHtml(dirty,{
    allowedTags: [
        "address", "article", "aside", "footer", "header", "h1", "h2", "h3", "h4",
        "h5", "h6", "hgroup", "main", "nav", "section", "blockquote", "dd", "div",
        "dl", "dt", "figcaption", "figure", "hr", "li", "main", "ol", "p", "pre",
        "ul", "a", "abbr", "b", "bdi", "bdo", "br", "cite", "code", "data", "dfn",
        "em", "i", "kbd", "mark", "q", "rb", "rp", "rt", "rtc", "ruby", "s", "samp",
        "small", "span", "strong", "sub", "sup", "time", "u", "var", "wbr", "caption",
        "col", "colgroup", "table", "tbody", "td", "tfoot", "th", "thead", "tr","img","video"
      ],
      disallowedTagsMode: 'discard',
      allowedAttributes: {
        a: [ 'href', 'name', 'target', 'class' ],
        // We don't currently allow img itself by default, but this
        // would make sense if we did. You could add srcset here,
        // and if you do the URL is checked for safety
        img: ['src','class','style'],
        video:['src','controls','type','style','class']
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

export const getTime = (time) =>{
    let t = parseInt((Date.now() - Date.parse(time))/1000)
        if(t<60){
            return `${t}초 전`
        }else if(t<3600){
            return `${parseInt(t/60)}분 전`
        }else if(t<86400){
            return `${parseInt(t/3600)}시간 전`
        }else{
            return time.replaceAll("-",".").replace("T"," ")
        }
}

export const convertUnitOfNum = (num) =>{
    if(num<1000) return num
    else if(num<10000) return `${(num/1000).toFixed(1)} 천`
    else if(num<1000000) return `${(num/10000).toFixed(1)} 만`
    else return `${(num/1000000).toFixed(2)} M`
}