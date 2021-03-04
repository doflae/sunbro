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
        this.IDinValidator = this.IDinValidator.bind(this)
        this.PWinValidator = this.PWinValidator.bind(this)
        this.checkIDDuplicate = this.checkIDDuplicate.bind(this)
		this.defaultAttrs = {required:true};
		this.formModel = [
			{label: "ID", attrs:{type:"text", pattern:"^(?=.*[a-zA-Z])[a-zA-Z0-9]{5,20}$"
        },onChange:this.IDinValidator,checkDuplicate:this.checkIDDuplicate},
			{label: "Password", attrs: {name:"password", type: "password", pattern:"^(?=.*[A-Za-z])(?=.*[0-9])(?=.*[@$!%*#?&])[A-Za-z0-9@$!%*#?&]{8,}$"},
            onChange:this.PWinValidator},
            {label: "Confirm Password", attrs: {name:"confirm password", type: "password"}},
            {label: "name", attrs: {type:"text"},checkDuplicate:this.checkNameDuplicate},
		];
	}

    checkIDDuplicate = (value) =>{
        return Axios.get(`/account/checkiddup?id=${value}`).then(res=>{
            if(res.data.success===false){
                return true;
            }else{
                return false;
            }
        })
    }

    checkNameDuplicate = (value) =>{
        return Axios.get(`/account/checknamedup?name=${value}`).then(res=>{
            if(res.data.success===false){
                return true;
            }else{
                return false;
            }
        })
    }

    IDinValidator(value){
        const errMessage = [];
        if(value==="") return errMessage;
        if(!value.match("^(?=.*[a-zA-Z])[a-zA-Z0-9]+$")){
            errMessage.push("알파벳 및 숫자만 입력해주세요.")
        }
        if(!value.match("^.{5,20}$")){
            errMessage.push("5~20자 이내 이어야 합니다.")
        }
        if(!value.match("[a-zA-Z]+")){
            errMessage.push("최소한 1개 이상의 알파벳을 포함해야합니다.")
        }
        return errMessage;
    }
    PWinValidator(value){
        const errMessage = [];
        if(value==="") return errMessage;
        if(!value.match("^.{8,}$")){
            errMessage.push("8자 이상이어야 합니다.")
        }
        if(!value.match("[@$!%*#?&]+")){
            errMessage.push("특수기호 @,$,!,%,*,#,?,& 를 포함시켜주세요.")
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
        formData.append("uid",credentials.id)
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