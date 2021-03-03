import React, { useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import userDefaultImg from "../static/img/user_default.png";
import Axios from "axios"

function UpdateProfile({user}){
    const [userDetail,setUserDetail] = useState(user)
    const [loading,setLoading] = useState(true)
    useEffect(()=>{
        Axios({method:"get",url:"/mypage/profile"})
    })
    let history = useHistory();

    return <div>
        <img src={userDetail.userImg}alt="" onError={(e)=>{e.target.onerror=null;e.target.src=userDefaultImg;}}/>
        
    </div>
}

export default UpdateProfile