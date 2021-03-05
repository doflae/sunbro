import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {authWrapper} from "./AuthWrapper";
import {SignupForm} from "../forms/SignupForm";
import Axios from "axios";
export const Signup = withRouter(authWrapper(class extends Component{

	constructor(props){
		super(props);
		this.state={
			errorMessage: null
		}
        this.PWinValidator = this.PWinValidator.bind(this)
		this.defaultAttrs = {required:true};
		this.formModel = [
			{label: "Email", attrs:{type:"email"},checkEmail:true},
			{label: "Password", attrs: {name:"password", type: "password", pattern:"^(?=.*[A-Za-z])(?=.*[0-9])[A-Za-z0-9!@#$%^&*()-_+=~`]{8,}$"},
            onChange:this.PWinValidator},
            {label: "Confirm Password", attrs: {name:"confirm password", type: "password"}},
            {label: "name", attrs: {type:"text"},checkDuplicate:true},
		];
	}

    PWinValidator(value){
        const errMessage = [];
        if(value==="") return errMessage;
        if(!value.match("^.{8,}$")){
            errMessage.push("8자 이상이어야 합니다.")
        }
        if(!value.match("[0-9]+")){
            errMessage.push("최소 1개 이상의 숫자를 포함해야합니다.")
        }
        if(!value.match("[a-zA-Z]+")){
            errMessage.push("알파벳을 포함해야 합니다.")
        }
        return errMessage;
    }

	authenticate = (credentials) => {
        let formData = new FormData();
        formData.append("uid",credentials.email)
        formData.append("password",credentials.password)
        formData.append("name",credentials.name)
        Axios.post("/account/signup",formData).then(res=>{
            if(res.data.success){
                this.props.history.goBack();
            }
        })
	}

	submitError = () =>{
		this.setState({
			errorMessage:null,
		})
	}

	render = () =>
		<div className="row">
			<div className="col m-2">
				<SignupForm formModel={this.formModel}
				defaultAttrs={this.defaultAttrs}
				submitErrorCallback={this.submitError}
				submitCallback={this.authenticate}
				submitText="Signup"
				errorMessage={this.state.errorMessage}
				cancelCallback={()=> this.props.history.goBack()}
				cancelText="Cancel"
				/>
			</div>
		</div>
}))