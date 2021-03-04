import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {authWrapper} from "./AuthWrapper";
import {LoginForm} from "../forms/LoginForm";

export const Login = withRouter(authWrapper(class extends Component{

	constructor(props){
		super(props);
		this.state={
			errorMessage: null
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
		</div>
}))