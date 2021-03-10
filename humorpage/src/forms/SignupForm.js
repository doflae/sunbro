import React, {Component} from "react"
import {ValidationError} from "./ValidationError"
import {GetMessages} from "./ValidationMessages"
import {ValidationSuccess} from "./ValidationSuccess"
import Axios from "axios"
import {ValidationEmail} from "./ValidationEmail";

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
		const value = target.previousElementSibling.value
		const {validationErrors, validationSuccess} = this.state
		Axios.get(`/account/checkdup/id?id=${value}`).then(res=>{
			if(res.data.success){
                validationSuccess[targetName] = `${res.data.msg}`
                validationErrors[targetName] = null
				this.setState({
					validationErrors:validationErrors,
					validationSuccess:validationSuccess,
					validationEmail:this.checkCode,
					email:value
				})
            }
            else{
                validationErrors[targetName] = [`${res.data.msg}`]
                validationSuccess[targetName] = null
				this.setState({
					validationErrors:validationErrors,
					validationSuccess:validationSuccess,
					validationEmail:null,
					email:value
				})
            }
            
		})
	}

	checkDuplicate = (targetName) => (e)=>{
		let target = e.target
		const value = target.previousElementSibling.value
        const {validationErrors,validationSuccess} = this.state
		Axios.get(`/account/checkdup/${targetName}?${targetName}=${value}`).then(res=>{
			if(res.status===200 && res.data.success){
                validationSuccess[targetName] = `사용 가능한 ${targetName.toUpperCase()} 입니다.`
                validationErrors[targetName] = null
            }
            else{
                validationErrors[targetName] = [`${targetName.toUpperCase()} 중복입니다.`]
                validationSuccess[targetName] = null
            }
            this.setState({
                validationErrors:validationErrors,
                validationSuccess:validationSuccess
            })
		})
	}

	renderElement = (modelItem) => {
		const name = modelItem.name || modelItem.label.toLowerCase();
		const EmailValidator = name==="email"?(<React.Fragment>
			<button onClick={this.checkEmail(name)}>이메일 인증</button>
			<ValidationEmail onClick={this.state.validationEmail} checkClear={this.state.isChecked}/>
			</React.Fragment>):null
		const DuplicateChecker = name==="name"?<button onClick={this.checkDuplicate(name)}>중복 확인</button>:null
		return <div className="form-group" key={modelItem.label}>
					<label>{modelItem.label}</label>
					<input className="form-control" name={name} ref={this.registerRef}
					{...this.props.defaultAttrs}{...modelItem.attrs} 
					onChange={modelItem.onChange?this.validateOnchange(name,modelItem.onChange):null}/>
					{EmailValidator}
					{DuplicateChecker}
					<ValidationError errors={this.state.validationErrors[name]}/>
					<ValidationSuccess success={this.state.validationSuccess[name]}/>
				</div>
		
	}

	render(){
		return <React.Fragment>
			{this.props.formModel.map(m=> this.renderElement(m))}
			{this.props.errorMessage!= null &&
				<p>{this.props.errorMessage}</p>
			}
			<div className="text-center">
				<button className="btn btn-secondary m-1"
				onClick={this.props.cancelCallback}>
					{this.props.cancelText || "Cancel"}
				</button>
				<button className="btn btn-primary m-1"
				onClick={this.handleSubmit}>
					{this.props.submitText || "Submit"}
				</button>
			</div>
		</React.Fragment>
	}

}