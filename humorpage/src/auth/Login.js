import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {authWrapper} from "./AuthWrapper";
import {LoginForm} from "../forms/LoginForm";
import KaKaoLogin from "react-kakao-login";
import GoogleLogin from "react-google-login";
import NaverLogin from "react-naver-login";
import FacebookLogin from "react-facebook-login/dist/facebook-login-render-props";
import styled from 'styled-components'
import Profile from "./Profile";
import {Signup} from './Signup';
import {FindPassword} from "./FindPassword";

export const Login = withRouter(authWrapper(class extends Component{

	constructor(props){
		super(props);
		this.state={
			errorMessage: null,
			data:null,
			platform:false,
			userDetail:null
		}
		this.formModel = [
			{name:"uid",
			required:"true",
			attrs:{type:"text", placeholder:"아이디를 입력해주세요"}},
			{name:"password", 
			required:"true",
			attrs: {type: "password", placeholder:"패스워드를 입력해주세요"}},
			{label: "로그인 상태 유지",
			name:"keepLogin",
			attrs:{type:"checkbox", defaultChecked:"true",style:{width:"fit-content"}}}
		];
	}



	authenticate = (credentials) => {
		this.props.authenticate(credentials)
		.then((res)=>{
			this.props.setAuthPageOption(-1);
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

	responseKaKao = (response) =>{
		const formData = new FormData();
		const profile = response.profile
		formData.append('uid',profile.id)
		formData.append('platForm',"KAKAO")
		formData.append('token',response.response.access_token)
		this.props.request("post","/account/pf-login",formData).then(res=>{
			if(res.data.success){
				this.props.setAuthPageOption(-1);
			}else{
				const userDetail = new Set();
				userDetail.uid = "KAKAO"+profile.id
				const account = profile.kakao_account
				if(account.has_gender===true){
					userDetail.gender = account.gender==="male"?"Male":"Female";
				}
				if(account.has_age_range===true){
					userDetail.age = account.age_range.split("~")[0]
				}
				userDetail.platform="KAKAO"
				userDetail.token = response.response.access_token
				this.setState({
					userDetail:userDetail,
				})
				this.props.setAuthPageOptions(2);
			}
		})
	}
	responseGoogle = (user) =>{
		const formData = new FormData();
		const id = user.profileObj.googleId
		formData.append('uid',id)
		formData.append('platForm',"GOOGLE")
		formData.append('token',user.accessToken)
		this.props.request("post","/account/pf-login",formData).then(res=>{
			if(res.data.success){
				this.props.setAuthPageOption(-1);
			}else{
				const userDetail = new Set();
				userDetail.uid = id
				userDetail.platform = "GOOGLE"
				userDetail.token = user.accessToken
				this.setState({
					userDetail:userDetail,
				})
				this.props.setAuthPageOptions(2);
			}
		})
	}

	responseNaver = (user) =>{
		const formData = new FormData();
		const access_token = localStorage.getItem('com.naver.nid.access_token').split('.')[1]
		formData.append('uid',user.id)
		formData.append('platForm',"NAVER")
		formData.append('token',access_token)
		this.props.request("post","/account/pf-login",formData).then(res=>{
			if(res.data.success){
				this.props.setAuthPageOption(-1);
			}else{
				const userDetail = new Set();
				userDetail.uid = "NAVER"+user.id
				userDetail.age = user.age!==undefined?user.age.split("-")[0]:"0"
				userDetail.platform = "NAVER"
				userDetail.token = access_token
				if(user.gender!==undefined){
					const gender = user.gender==="M"?"Male":"Female";
					userDetail.gender = gender
				}
				this.setState({
					userDetail:userDetail,
				})
				this.props.setAuthPageOptions(2);
			}
		})
		
	}

	responseFacebook = (user) =>{
		const formData = new FormData();
		formData.append('uid',user.id);
		formData.append('platForm',"FACEBOOK")
		formData.append('token',user.accessToken)
		this.props.request("post","/account/pf-login",formData).then(res=>{
			if(res.data.success){
				this.props.setAuthPageOption(-1);
			}else{
				const userDetail = new Set();
				userDetail.uid = "FACEBOOK"+user.id;
				userDetail.platform = "FACEBOOK"
				userDetail.token = user.accessToken
				this.setState({
					userDetail:userDetail,
				})
				this.props.setAuthPageOptions(2);
			}
		})
	}

	SignUpBtn = () => (e) =>{
		this.props.setAuthPageOption(1);
	}

	DeletePage = () =>(e) =>{
		this.props.setAuthPageOption(-1);
	}
	FindPw = () => (e) =>{
		this.props.setAuthPageOption(3);
	}

	renderPage = () =>{
		if(this.props.authPageOption==3) return <FindPassword/>
		if(this.props.authPageOption==2) return <Profile userDetail={this.state.userDetail}/>
		if(this.props.authPageOption==1) return <Signup/>
		return <div>
			<LoginFormZoneStlyed>
			<LoginForm formModel={this.formModel}
			submitErrorCallback={this.submitError}
			submitCallback={this.authenticate}
			submitText="로그인"
			errorMessage={this.state.errorMessage}
			/>
			<UserServiceZoneStyled>
				<UserServiceBtnStyled onClick={this.SignUpBtn()}>회원가입</UserServiceBtnStyled>
				<UserServiceBtnStyled onClick={this.FindPw()}>비밀번호 찾기</UserServiceBtnStyled>
			</UserServiceZoneStyled>
			</LoginFormZoneStlyed>
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
				callbackUrl="http://3.138.119.161/login"
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
	}

	render = () => {
		if(this.props.authPageOption<0) return null;
		return <AuthBoxStyled>
			<CancelBtnStyled onClick={()=>{this.props.setAuthPageOption(-1)}}/>
			{this.renderPage()}
		</AuthBoxStyled>
	}
}))

const UserServiceZoneStyled = styled.div`
	display:flex;
	justify-content: space-around;
	margin:20px 0px 20px 0px;
`	


const UserServiceBtnStyled = styled.div`
	text-align:center;
	font-weight:800;
	font-size:1.1em;
	opacity:0.3;
	cursor:pointer;
	&:hover{
		opacity:0.7;
	}
`

const CancelBtnStyled = styled.button`
	position: absolute;
	top: 0px;
	right: 0px;
	width: 24px;
	height: 24px;
	background-color: #fff;
	border: 0px;
	opacity:0.4;
	&:hover{
		opacity:0.7;
	}
    &::before, &::after{
		position: absolute;
		left: 11px;
		bottom: 2px;
		content: ' ';
		height: 18px;
		width: 2px;
		background-color: rgb(3,3,3);
    }
    &::before{
	    transform: rotate(45deg);
    }
    &::after{
        transform: rotate(-45deg);
    }
`

const AuthBoxStyled = styled.div`
	z-index:1;
	position: fixed;
	left: calc(50% - 175px);
	width: 350px;
	min-height: 500px;
	margin-top: 20px;
	padding: 20px;
	box-sizing: border-box;
	border-radius: 10px;
	background-color: #fff;
	box-shadow: rgb(0 0 0 / 56%) 0px 3px 3px 0px, rgb(0 0 0 / 56%) 0px 0px 2px 0px;
`

const LoginFormZoneStlyed = styled.div`
	width:300px;
	margin:auto;
`

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