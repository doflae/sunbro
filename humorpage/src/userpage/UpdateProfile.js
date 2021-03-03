import React, { useState,createRef } from "react"
import { useHistory } from "react-router-dom"
import userDefaultImg from "../static/img/user_default.png";
import Dropzone from "react-dropzone"
import {ReactComponent as Pencil} from '../static/svg/pencil.svg'
import {authWrapper} from "../auth/AuthWrapper"
import {YearsSelector} from "../utils/Utils"
import Axios from "axios";
function UpdateProfile({userDetail,...props}){
    const [userImg,setUserImg] = useState(userDetail.userImg)
    const [name,setName] = useState(userDetail.name)
    const [sex, setSex] = useState(userDetail.sex)
    const [birth, setBirth] = useState(userDetail.birth)
    const [candelete,setCandelete] = useState(null)
    let history = useHistory();
    const dropzoneRef = createRef()

    const imageHandler = () => (e) =>{
        e.preventDefault();
        if(dropzoneRef) dropzoneRef.current.open();
    }
    const onDrop = async(acceptFile) =>{
        try{
            await acceptFile.reduce((pacc, _file) =>{
                if(_file.type.split("/")[0] ==="image"){
                    return pacc.then(async()=>{
                        await savefile(_file).then((res)=>{
                            if (res.success){
                                setUserImg(res.data);
                                setCandelete(res.data);
                            }else{
                                history.push("/login")
                            }
                        });
                    });
                }else{
					return null;
				}
            }, Promise.resolve());
        } catch(error){}
    }
    const savefile = (file) =>{
        const formData = new FormData();
        formData.append('file',file)
        if (candelete!==null){
            formData.append('src',candelete)
        }
        return props.request("post","/file/upload",formData,{
            headers:{
            'Content-Type':'multipart/form-data'
            }
        }).then(
            (res)=>{
            return res.data
            },
            (error)=>{
            return Promise.reject(error);
            }
        );
    }
    const sexHandler = () => (e)=>{
        if(e.target.checked){
            setSex(e.target.value)
        }
    }
    const submit = () => (e) =>{
        let form = new FormData();
        form.append('userImg',userImg)
        form.append('name',name)
        form.append('sex',sex)
        form.append('birth',birth)
        console.log(userImg,name,sex,birth)
        Axios.post("/account/update",form).then(
            res=>{
                if(res.data.success){
                    history.push("/mypage");
                    history.go();
                }
            }
        )
    }
    return <div>
        <div className="myprofile">
            <div className="myprofile_imgzone" onClick={imageHandler()}>
                <img className="myprofile_img" src={userImg} alt=""  onError={(e)=>{e.target.onerror=null;e.target.src=userDefaultImg;}}/>
                <Pencil width="20" height="20" className="myprofile_pencil"/>
            </div>
        </div>
        <input type="text" value={name} onChange={e=>{e.preventDefault();setName(e.target.value)}}></input><br/>
        <label><input type="checkbox" name="sex" value="Male"
        checked={sex==="Male"?true:false}
        onChange={sexHandler()}></input>남성</label>
        <label><input type="checkbox" name="sex" value="Female"
        checked={sex==="Female"?true:false}
        onChange={sexHandler()}></input>여성</label><br/>
        <label>생년
            <select name="birth" onChange={e=>{e.preventDefault();setBirth(e.target.value);}}>
            <YearsSelector selected={birth}/>
        </select></label>
        <br/>
        <button onClick={submit()}>수정 완료</button>
        <button onClick={(e)=>{e.preventDefault();history.goBack();}}>취소</button>
        <Dropzone
        ref = {dropzoneRef}
        accept = "image/*"
        onDrop = {onDrop}
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
}

export default authWrapper(UpdateProfile);