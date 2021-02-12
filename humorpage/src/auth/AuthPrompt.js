import React, {Component} from "react";
import {withRouter} from "react-router-dom";
import {authWrapper} from "./AuthWrapper";
import {ValidatedForm} from "../forms/ValidatedForm";

export const AuthPrompt = withRouter(authWrapper(class extends Component{

	constructor(props){
		super(props);
		this.state={
			logined:false,
			errorMessage: null
		}
		this.defaultAttrs = {required:true};
		this.formModel = [
			{label: "ID", attrs:{name:"uid"}},
			{label: "Password", attrs: {type: "password"}},
		];
	}

	authenticate = (credentials) => {
		console.log(this.props)
		this.props.authenticate(credentials)
		.catch(err => this.setState({errorMessage:err.message}))
		.then(
			this.setState({logined:true},
				()=>this.props.history.push("/contexts")));//로그인 성공시 이동경로
	}

	render = () =>
		<div className="row">
			<div className="col m-2">
				{this.state.errorMessage != null &&
				<h4 className="bg-danger text-center text-white m-1 p-2">
					{this.state.errorMessage}	
				</h4>
				}
				<ValidatedForm formModel={this.formModel}
				defaultAttrs={this.defaultAttrs}
				submitCallback={this.authenticate}
				submitText="Login"
				cancelCallback={()=> this.props.history.push("/contexts")}//로그인 실패시 이동 경로
				cancelText="Cancel"
				/>
			</div>
		</div>
}))