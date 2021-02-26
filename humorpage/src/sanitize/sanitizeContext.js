import React from "react"

export const SanitizeContext = React.createContext({
    sanitize:(dirty)=>{},
    sanitizeHarder:(dirty)=>{},
    sanitizeNonNull:(dirty)=>{},
})