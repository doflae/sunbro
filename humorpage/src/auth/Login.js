import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {authWrapper} from "./AuthWrapper";
import {LoginForm} from "../forms/LoginForm";
import KaKaoLogin from "react-kakao-login";
import GoogleLogin from "react-google-login";
import NaverLogin from "react-naver-login";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import styled from 'styled-components'

const GoogleBtn = styled.div`
	padding: 0;
	margin:5px;
	width:300px;
	height:45px;
	line-height:44px;
	background-color: #ffffff;
	color: rgba(0, 0, 0, 0.54);
	border: 1px solid transparent;
	border-radius: 3px;
	font-size: 14px;
	font-weight: bold;
	text-align: center;
	cursor: pointer;
	box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
	&:hover {
		box-shadow: 0 0px 15px 0 rgba(0, 0, 0, 0.2);
		opacity:0.9;
	}
`


const FacebookBtn = styled.div`
	padding: 0;
	margin:5px;
	width:300px;
	height:45px;
	line-height:44px;
	background-color: #4c69ba;
	color: #ffffff;
	border: 1px solid transparent;
	border-radius: 3px;
	font-size: 14px;
	font-weight: bold;
	text-align: center;
	cursor: pointer;
	box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
	&:hover {
		box-shadow: 0 0px 15px 0 rgba(0, 0, 0, 0.2);
	}
`

const NaverBtn  = styled.div`
	padding: 0;
	margin:5px;
	width:300px;
	height:45px;
	line-height:44px;
	background-color: #1EC800;
	color: #ffffff;
	border: 1px solid transparent;
	border-radius: 3px;
	font-size: 14px;
	font-weight: bold;
	text-align: center;
	box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
	cursor: pointer;
	&:hover {
		box-shadow: 0 0px 15px 0 rgba(0, 0, 0, 0.2);
	}
`
const KaKaoBtn = styled.div`
	padding: 0;
	margin:5px;
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
	box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
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
			{label: "ID", attrs:{type:"email"}},
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
		if(account.has_gender===true){
			if(account.gender==="male") formData.append("sex","Male")
			else formData.append("sex","Female")
		}
		if(account.has_age_range===true){
			formData.append("age",account.age_range.split("~")[0])
		}
		this.props.request("post","/account/anologin",formData).then(res=>{
			if(res.data.success){
				this.props.history.push("/boards")
			}
		})
	}
	responseGoogle = (res) =>{
		const formData = new FormData();
		const id = res.profileObj.googleId
		formData.append('uid',"Google"+id)
		formData.append('name',"GPerson"+id)
		formData.append("age",0)
		formData.append("sex","Male")
		this.props.request("post","/account/anologin",formData).then(res=>{
			if(res.data.success){
				this.props.history.push("/boards")
			}
		})
	}

	responseNaver = (res) =>{
		const formData = new FormData();
		formData.append('uid',"Naver"+res.id)
		formData.append('name',"NPerson"+res.id)
		const age = res.age!==undefined?res.age.split("-")[0]:"0"
		formData.append("age",age)
		if(res.gender!==undefined){
			const gender = res.gender==="M"?"Male":"Female";
			formData.append("sex",gender)
		}
		this.props.request("post","/account/anologin",formData).then(res=>{
			if(res.data.success){
				this.props.history.push("/boards")
			}
		})
	}

	responseFacebook = (res) =>{
		console.log(res)
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
			<KaKaoLogin
				token={'73d8ed482d24e9f165b966171888efb5'}
				render={({onClick})=>{return <KaKaoBtn onClick={e=>{e.preventDefault();onClick();}}>
					카카오 계정으로 로그인
				</KaKaoBtn>}}
				onSuccess={this.responseKaKao}
				getProfile={true}
			/>
			<GoogleLogin
				clientId="937114933155-5kp79ab3dmac3chu169golok7sk8l8us.apps.googleusercontent.com"
				render={props=><GoogleBtn onClick={props.onClick}>구글 계정으로 로그인</GoogleBtn>}
				onSuccess={this.responseGoogle}
				onFailure={this.responseGoogle}
				cookiePolicy={'single_host_origin'}
			/>
			<NaverLogin
				clientId="zqxoO0A0cJnsQXAf6CVm"
				callbackUrl="http://localhost:3000/login"
				render={(props)=><NaverBtn onClick={props.onClick}>네이버 계정으로 로그인</NaverBtn>}
				onSuccess={this.responseNaver}
				onFailure={(result)=>console.error(result)}
			/>
			<FacebookLogin
				appId="480950229948387"
				autoLoad={false}
				fields="name,email,picture"
				render={props=>(
					<FacebookBtn onClick={props.onClick}>페이스북 계정으로 로그인</FacebookBtn>
				)}
				callback={this.responseFacebook}
			/>
		</div>
}))