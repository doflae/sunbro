import React, {Component} from "react"
import {ValidationError} from "./ValidationError"
import {GetMessages} from "./ValidationMessages"
import {ValidationSuccess} from "./ValidationSuccess"
import Axios from "axios"
import {FormGroupStyled, FormInputControlStyled} from "./LoginForm";
import styled from 'styled-components';


export class SignupForm extends Component{

	constructor(props){
		super(props)
		this.state={
			validationErrors:{},
            validationSuccess:{},
			validationEmail:null,
            check:false,
			email:null,
			isChecked:null,
		}
		this.formElements = {};
		this.checkCode = this.checkCode.bind(this)
		this.name = null;
	}

	handleSubmit = () => {
        let pw;
		this.setState(state => {
			const newState = { ...state, validationErrors:{}}
			if(!this.state.isChecked){
				newState.validationErrors["email"]=["이메일 인증이 필요합니다."]
			}
			Object.values(this.formElements).forEach(elem =>{
				if(elem.name==="confirm password"){
					if(elem.value!==pw){
						newState.validationErrors[elem.name] = ["password not match"];
						this.props.submitErrorCallback();
					}
				}
				if(elem.name==="password"){
					pw=elem.value
				}
				if (!elem.checkValidity()){
					newState.validationErrors[elem.name] = GetMessages(elem);
					this.props.submitErrorCallback();
				}
			})
            newState.check = true
			if(this.state.validationSuccess["name"]==null||!this.state.validationSuccess["name"].startsWith("사")){
				newState.validationSuccess["name"]="중복 확인이 필요합니다."
				newState.check = false
			}else if(this.state.validationSuccess["name"].startsWith("사")){
				newState.validationSuccess["name"] = this.state.validationSuccess["name"]
			}
			return newState;
		}, () => {
			if(Object.keys(this.state.validationErrors).length === 0 && this.state.check===true){
				const data = Object.assign(...Object.entries(this.formElements)
				.map(e=>({[e[0]]:e[1].value})) )
				this.props.submitCallback(data);
			}
		});
	}

	registerRef = (element) => {
		if(element !== null) {
			this.formElements[element.name] = element;
		}
	}

	validateOnchange = (targetName,func)=>(e)=>{
		let target = e.target
		const value = target.value
		const {validationErrors,validationSuccess} = this.state
		validationErrors[targetName] = func(value)
        validationSuccess[targetName] = null;
		this.setState({
			validationErrors:validationErrors,
            validationSuccess:validationSuccess
		})
		
	}

	checkCode = (code) =>{
		const {email,validationSuccess} = this.state;
		const formData = new FormData();
		formData.append("email",email);
		formData.append("code",code);
		Axios.post("/account/checkcode",formData).then(res=>{
			if(res.status===200 && res.data.success===true){
				validationSuccess["email"] = null
				this.setState({
					isChecked:true,
					validationSuccess:validationSuccess,
					validationEmail:null,
				})
				this.formElements["email"].setAttribute("disabled","");
			}else{
				this.setState({
					isChecked:false,
				})
			}
		})
	}

	checkEmail = (targetName) => (e) =>{
		let target = e.target
		const elem = target.previousElementSibling
		const {validationErrors, validationSuccess} = this.state
		if(!elem.checkValidity()){
			validationErrors[targetName] = GetMessages(elem);
			validationSuccess[targetName] = null;
			this.setState({
				validationErrors:validationErrors,
				validationSuccess:validationSuccess
			})
			return;
		}
		Axios.get(`/account/checkdup/id?id=${elem.value}`).then(res=>{
			if(res.data.success){
                validationSuccess[targetName] = `${res.data.msg}`
                validationErrors[targetName] = null
				this.setState({
					validationErrors:validationErrors,
					validationSuccess:validationSuccess,
					validationEmail:this.checkCode,
					email:elem.value
				})
            }
            else{
                validationErrors[targetName] = [`${res.data.msg}`]
                validationSuccess[targetName] = null
				this.setState({
					validationErrors:validationErrors,
					validationSuccess:validationSuccess,
					validationEmail:null,
					email:elem.value
				})
            }
            
		})
	}

	checkDuplicate = (targetName) => (e)=>{
		let target = e.target
		const elem = target.previousElementSibling
		const {validationErrors, validationSuccess} = this.state
		if(!elem.checkValidity()){
			validationErrors[targetName] = GetMessages(elem);
			validationSuccess[targetName] = null;
		}
		else if(elem.value!==this.name){
			this.name = value;
			Axios.get(`/account/checkdup/${targetName}?${targetName}=${elem.value}`).then(res=>{
				if(res.status===200 && res.data.success){
					validationSuccess[targetName] = `사용 가능한 ${targetName.toUpperCase()} 입니다.`
					validationErrors[targetName] = null
				}
				else{
					validationErrors[targetName] = [`${targetName.toUpperCase()} 중복입니다.`]
					validationSuccess[targetName] = null
				}
			})
		}
		this.setState({
			validationErrors:validationErrors,
			validationSuccess:validationSuccess
		})
	}

	renderElement = (modelItem) => {
		const name = modelItem.name || modelItem.label.toLowerCase();
		const EmailValidator = name==="email"?(<React.Fragment>
			<CheckBtnStyled onClick={this.checkEmail(name)}>이메일 인증</CheckBtnStyled>
			<ValidationEmail onClick={this.state.validationEmail} checkClear={this.state.isChecked}/>
			</React.Fragment>):null
		const DuplicateChecker = name==="name"?
		<CheckBtnStyled onClick={this.checkDuplicate(name)}>중복 확인</CheckBtnStyled>:null
		
		return <FormGroupStyled key={modelItem.label}>
					<FormLabelStyled>{modelItem.label}</FormLabelStyled>
					<FormInputControlStyled className="form-control" name={name} ref={this.registerRef}
					{...this.props.defaultAttrs}{...modelItem.attrs} 
					onChange={modelItem.onChange?this.validateOnchange(name,modelItem.onChange):null}/>
					{EmailValidator}
					{DuplicateChecker}
					<ValidationError errors={this.state.validationErrors[name]}/>
					<ValidationSuccess success={this.state.validationSuccess[name]}/>
				</FormGroupStyled>
		
	}

	render(){
		return <React.Fragment>
			{this.props.formModel.map(m=> this.renderElement(m))}
			{this.props.errorMessage!= null &&
				<p>{this.props.errorMessage}</p>
			}
			<SignUpBtnZoneStlyed>
				<BtnStyled 
				theme={{color:"#fff",
						bgcolor:"#ec4646"}}
				onClick={this.handleSubmit}>
					{this.props.submitText || "회원 가입"}
				</BtnStyled>
				<BtnStyled 
				theme={{color:"#aaa",
						bgcolor:"#ddd"}}
				onClick={this.props.cancelCallback}>
					{this.props.cancelText || "로그인"}
				</BtnStyled>
			</SignUpBtnZoneStlyed>
		</React.Fragment>
	}
}


class ValidationEmail extends Component{
    render(){
        if(this.props.checkClear!==null && this.props.checkClear===false){
            return <div>
                <input type="text" placeholder="이메일 인증 코드를 입력해주세요."></input>
                <CheckBtnStyled onClick={e=>{
					e.preventDefault();
					this.props.onClick(e.target.previousElementSibling.value)
				}}>
						코드 인증
				</CheckBtnStyled>
                <EmailAuthFailed>이메일 인증에 실패하였습니다. 코드를 다시 확인해주세요.</EmailAuthFailed>
            </div>
        }
        else if(this.props.onClick){
            return <FlexDivStlyed>
                <FormInputControlStyled 
				theme={{width:"70%"}}
				type="text" placeholder="코드 입력"/>
                <CheckBtnStyled onClick={e=>{
					e.preventDefault(); 
					this.props.onClick(e.target.previousElementSibling.value)
				}}>
						코드 인증
				</CheckBtnStyled>
            </FlexDivStlyed>
        }else if(this.props.checkClear){
            return <EmailAuthSuccess>
                이메일 인증에 성공하였습니다.
            </EmailAuthSuccess>
        }
        return null;
    }
}

const FlexDivStlyed = styled.div`
	display:flex;
	justify-content:space-between;
`

const EmailAuthSuccess = styled.div`
    color : #54e346;
`
const EmailAuthFailed = styled.div`
    color : #f05454;
`

const FormLabelStyled = styled.div`
	font-size:1.1em;
	font-weight:800;
	opacity:0.6;
`

const CheckBtnStyled = styled.div`
	width: fit-content;
	text-align: center;
	margin-top: 5px;
	border-radius: 5px;
	margin-bottom: 5px;
	padding: 5px;
	font-size: 1.1em;
	border: 1px solid;
	opacity: 0.3;
	font-weight: 800;
	cursor: pointer;
`

const SignUpBtnZoneStlyed = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
`

const BtnStyled = styled.div`
	width:50%;
	margin:0px 2px 0px 2px;
	text-align: center;
	margin-top:5px;
	border-radius: 5px;
	margin-bottom: 5px;
	padding: 5px;
	font-size: 1.1em;
	font-weight: 800;
	cursor: pointer;
	
	color: ${props=>props.theme.color};
	background-color:${props=>props.theme.bgcolor};

`