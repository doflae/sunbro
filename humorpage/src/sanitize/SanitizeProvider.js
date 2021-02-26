import React, {Component} from "react"
import {SanitizeContext} from "./sanitizeContext"
import sanitizeHtml from "sanitize-html-react";

export class SanitizeProviderImpl extends Component{

    sanitizeNonNull = (dirty) => {
        const result = this.sanitize(dirty)
        if(result==="null"){
            return ""
        }else{
            return result
        }
    }
    sanitize = (dirty) => sanitizeHtml(dirty,{
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

    sanitizeHarder = (dirty) => sanitizeHtml(dirty,{
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

    render = () =>
        <SanitizeContext.Provider value = {{...this.state,
        sanitize: this.sanitize, sanitizeHarder: this.sanitizeHarder, sanitizeNonNull:this.sanitizeNonNull}}>
            {this.props.children}
        </SanitizeContext.Provider>
}