import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {authWrapper} from "./AuthWrapper";
import {LoginForm} from "../forms/LoginForm";
import KaKaoLogin from "react-kakao-login";
import styled from 'styled-components'

const KaKaoBtn = styled(KaKaoLogin)`
	padding: 0;
	width: 300px;
	height: 45px;
	line-height: 44px;
	color: #783c00;
	background-color: #ffeb00;
	border: 1px solid transparent;
	border-radius: 3px;
	font-size: 14px;
	font-weight: bold;
	text-align: center;
	cursor: pointer;
	&:hover {
		box-shadow: 0 0px 15px 0 rgba(0, 0, 0, 0.2);
	}
`;

export const Login = withRouter(authWrapper(class extends Component{

	constructor(props){
		super(props);
		this.state={
			errorMessage: null,
			data:null,
		}
		this.defaultAttrs = {required:true};
		this.formModel = [
			{label: "ID", attrs:{type:"text"}},
			{label: "Password", attrs: {type: "password"}},
		];
	}

	authenticate = (credentials) => {
		this.props.authenticate(credentials)
		.then((res)=>{
			this.props.history.goBack();
		})
		.catch(err => {
			this.setState({errorMessage:err.message})
		});
	}

	submitError = () =>{
		this.setState({
			errorMessage:null,
		})
	}

	responseKaKao = (res) =>{
		const formData = new FormData();
		formData.append('uid',"KaKao"+res.profile.id)
		formData.append('name',"KPerson"+res.profile.id)
		const account = res.profile.kakao_account
		const response = res.response
		if(account.has_gender===true){
			if(account.gender==="male") formData.append("sex","Male")
			else formData.append("sex","Female")
		}
		if(account.has_age_range===true){
			formData.append("age",account.age_range.split("~")[0])
		}
		formData.append("accessTime",response.expires_in)
		formData.append("refreshTime",response.refresh_token_expires_in)
		this.props.request("post","/account/anologin",formData).then(res=>{
			if(res.data.success){
				if(res.data.code===38){
					this.props.request("/account/anologin",formData).then(res=>{
						if(res.data.success && res.data.code!==38){
							this.props.history.push("/boards");
						}
					})
				}else{
					this.props.history.push("/boards")
				}
			}
		})
	}

	render = () =>
		<div className="row">
			<div className="col m-2">
				<LoginForm formModel={this.formModel}
				defaultAttrs={this.defaultAttrs}
				submitErrorCallback={this.submitError}
				submitCallback={this.authenticate}
				submitText="Login"
				errorMessage={this.state.errorMessage}
				cancelCallback={()=> this.props.history.push("/boards")}//로그인 실패시 이동 경로
				cancelText="Cancel"
				/>
			</div>
			<button onClick={()=>this.props.history.push("/signup")}>회원가입</button>
			<KaKaoBtn
				token={'73d8ed482d24e9f165b966171888efb5'}
				buttonText="카카오 계정으로 로그인"
				onSuccess={this.responseKaKao}
				getProfile={true}
			/>
		</div>
}))