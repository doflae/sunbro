import React, {Component} from "react"
import {ValidationError} from "./ValidationError"
import {GetMessages} from "./ValidationMessages"
import styled from "styled-components"

export class LoginForm extends Component{

	constructor(props){
		super(props)
		this.state={
			validationErrors:{}
		}
		this.formElements = {};
	}

	handleSubmit = () => {
		this.setState(state => {
			const newState = { ...state, validationErrors:{}}
			Object.values(this.formElements).forEach(elem =>{
				if (!elem.checkValidity()){
					newState.validationErrors[elem.name] = GetMessages(elem);
					this.props.submitErrorCallback();
				}
			})
			return newState;
		}, () => {
			if(Object.keys(this.state.validationErrors).length === 0){
				const data = Object.assign(...Object.entries(this.formElements)
				.map(e=>{
					if(e[0]==="keepLogin") return ({[e[0]]:e[1].checked})
					return ({[e[0]]:e[1].value})}) )
				this.props.submitCallback(data);
			}
		});
	}

	
	componentDidMount(){
		window.addEventListener("keydown",e=>{
			if(e.key==="Enter"){
				this.handleSubmit();
			}
		})
	}
	componentWillUnmount(){
		window.removeEventListener("keydown",e=>{
			if(e.key==="Enter"){
				this.handleSubmit();
			}
		})
	}

	registerRef = (element) => {
		if(element !== null) {
			this.formElements[element.name] = element;
		}
	}

	renderElement = (modelItem) => {
		const name = modelItem.name;
		return <FormGroupStyled key={modelItem.name}>
			<FormInputControlStyled
			name={name} ref={this.registerRef}
			{...modelItem.attrs} />
			{modelItem.label}
			<ValidationError errors={this.state.validationErrors[name]}/>
		</FormGroupStyled>
	}

	render(){
		return <React.Fragment>
			{this.props.formModel.map(m=> this.renderElement(m))}
			{this.props.errorMessage!= null &&
				<p>{this.props.errorMessage}</p>
			}
			<LoginBtnStyled onClick={this.handleSubmit}>
				{this.props.submitText || "로그인"}
			</LoginBtnStyled>
		</React.Fragment>
	}
}


const LoginBtnStyled = styled.div`
	width: 100%;
	text-align: center;
	margin-top:5px;
	border-radius: 5px;
	margin-bottom: 5px;
	padding: 5px;
	font-size: 1.1em;
	font-weight: 800;
	cursor: pointer;
	background-color: #ec4646;
	color: #ffffff;
`

export const FormGroupStyled = styled.div`
	margin-bottom:8px
`
export const FormInputControlStyled = styled.input`
	margin-top: 5px;
	border: solid 1px rgb(0,0,0,32%);
	border-radius:3px;
	padding:10px;
	&:focus{
		outline:none;
		box-shadow: 0px 0px 5px 2px rgb(21, 151, 187);
	}

	width:${props=>props.theme.width||"100%"};
`