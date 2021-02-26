import React, {Component} from "react";

export class ValidationError extends Component{

	render(){
		if(this.props.errors){
			return this.props.errors.map(err=>
				<span className="text-danger" key={err}>
					{err}
				</span>
			)
		}
		return null;
	}

}