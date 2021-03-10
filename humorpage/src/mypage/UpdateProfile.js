// import React, { useState,createRef } from "react"
// import { useHistory } from "react-router-dom"
// import userDefaultImg from "../static/img/user_128x.png";
// import Dropzone from "react-dropzone"
// import {ReactComponent as Pencil} from '../static/svg/pencil.svg'
// import {authWrapper} from "../auth/AuthWrapper"
// import {AgeSelector, getRandomGenerator} from "../utils/Utils"
// import Axios from "axios";
// import { ValidationSuccess } from "../forms/ValidationSuccess";
// function UpdateProfile({userDetail,...props}){
//     const [userImg,setUserImg] = useState(userDetail.userImg)
//     const [name,setName] = useState(userDetail.name)
//     const [gender, setGender] = useState(userDetail.gender)
//     const [age, setAge] = useState(userDetail.age)
//     const [canSubmit, setCanSubmit] = useState(null)
//     const [mediaFormat, setMediaFormat] = useState(null)
//     const prevName = userDetail.name
//     let history = useHistory();
//     const dropzoneRef = createRef()

//     const imageHandler = () => (e) =>{
//         e.preventDefault();
//         if(dropzoneRef) dropzoneRef.current.open();
//     }
//     const checkDuplicate = () => (e) => {
//         let target = e.target
//         const value = target.previousElementSibling.value
//         Axios.get(`/account/checkdup/name?name=${value}`).then(res=>{
//             if(res.data.success) setCanSubmit("사용 가능한 NAME입니다.");
//             else setCanSubmit("중복된 NAME 입니다.")
//         })
//     }
//     const onDrop = async(acceptFile) =>{
//         var reader = new FileReader();
//         setMediaFormat(acceptFile[0].type.split("/")[1]);
//         reader.onload = (e) =>{
//             const dataURL = e.target.result;
//             var byteString = atob(dataURL.split(',')[1]);

//             var mimeString = dataURL.split(',')[0].split(':')[1].split(';')[0]

//             var ab = new ArrayBuffer(byteString.length);
//             var ia = new Uint8Array(ab);
//             for (var i = 0; i < byteString.length; i++) {
//               ia[i] = byteString.charCodeAt(i);
//             }

//             var blob = new Blob([ab], {type: mimeString});
//             setUserImg(URL.createObjectURL(blob))
//         }
//         if(acceptFile[0]) reader.readAsDataURL(acceptFile[0]);
       
//     }
//     const saveFile = (file,path) =>{
//         const formData = new FormData();
//         formData.append('file',file);
//         formData.append('path',path);
//         formData.append('needConvert',false)
//         formData.append('mediaType',"PROFILE")
//         Axios.post("/file/upload",formData,{
//           headers:{
//             'Content-Type':'multipart/form-data',
//           }
//         })
//     }
//     const genderHandler = () => (e)=>{
//         if(e.target.checked){
//             setGender(e.target.value)
//         }
//     }
//     const submit = () => async (e) =>{
//         if(prevName===name||(canSubmit!==null&&canSubmit.startsWith("사"))){
//             let form = new FormData();
//             if(userImg.startsWith("blob")){
//                 const filePath = "/profileImg/"+getRandomGenerator(21)+'.'+mediaFormat;
//                 form.append('userImg',filePath)
//                 fetch(userImg).then(r=>r.blob()).then(
//                     blob=>{
//                         saveFile(blob,filePath);
//                     }
//                 )
//             }else{
//                 form.append('userImg',userImg);
//             }
//             form.append('name',name)
//             form.append('gender',gender)
//             form.append('age',age)
//             Axios.post("/account/update",form).then(
//                 res=>{
//                     if(res.data.success){
//                         history.push("/mypage");
//                         history.go();
//                     }
//                     else{
//                         history.push("/login");
//                     }
//                 }
//             )
//         }else{
//             setCanSubmit("중복 확인이 필요합니다.");
//         }
//     }
//     const imageDelete = ()=>(e) =>{
//         setUserImg("");
//     }
//     return <div>
//         <div className="myprofile">
//             <div className="myprofile_imgzone">
//                 <button className="profileimg_delete" onClick={imageDelete()}></button>
//                 <div onClick={imageHandler()}>
//                     <img className="myprofile_img" src={userImg} alt=""  onError={(e)=>{e.target.onerror=null;e.target.src=userDefaultImg;}}/>
//                     <Pencil width="20" height="20" className="myprofile_pencil"/>
//                 </div>
//             </div>
//         </div>
//         <input type="text" value={name} onChange={e=>{e.preventDefault();setName(e.target.value)}}></input><button onClick={checkDuplicate()}>중복확인</button><br/>
//         <ValidationSuccess success={canSubmit}/>
//         <label><input type="checkbox" name="gender" value="Male"
//         checked={gender==="Male"?true:false}
//         onChange={genderHandler()}></input>남성</label>
//         <label><input type="checkbox" name="gender" value="Female"
//         checked={gender==="Female"?true:false}
//         onChange={genderHandler()}></input>여성</label><br/>
//         <label>생년
//             <select name="age" value={age} onChange={e=>{e.preventDefault();setAge(e.target.value);}}>
//             <AgeSelector/>
//         </select></label>
//         <br/>
//         <button onClick={submit()}>수정 완료</button>
//         <button onClick={(e)=>{e.preventDefault();history.goBack();}}>취소</button>
//         <Dropzone
//         ref = {dropzoneRef}
//         accept = "image/*"
//         onDrop = {onDrop}
//         multiple = {false}
//         styles={{dropzone:{width:0,height:0}}}
//         >
//         {({getRootProps, getInputProps}) =>(
//         <section>
//             <div {...getRootProps()}>
//             <input {...getInputProps()}/>
//             </div>
//         </section>
//         )}
//         </Dropzone>
//     </div>
// }

// export default authWrapper(UpdateProfile);