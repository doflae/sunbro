import React, { useState } from "react"
import {UpdateProfileForm} from "../forms/UpdateProfileForm"
import Axios from "axios"
import { useHistory } from "react-router-dom"
function UpdateProfile({userDetail}){
    const formModel = [
        {label:"ID", attrs:{type:"text"}},
        {label:"Password", attrs:{type:"password"}},
        {label:"Sex", attrs:{type:"radio"}}
    ]
    const defaultAttrs = true
    const [errorMessage,setErrorMessage] = useState(null);
    let history = useHistory();
    const updateProfile = (forms) => {
        console.log(forms)
    }
    return <div className="profile">
        <UpdateProfileForm formModel={formModel}
        defaultAttrs={defaultAttrs}
        submitErrorCallback = {setErrorMessage(null)}
        submitCallback = {updateProfile}
        submitText = "수정"
        errorMessage={errorMessage}
        cancelCallback={()=>history.goBack()}
        cancelText="취소"
        />
    </div>
}

export default UpdateProfile