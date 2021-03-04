import React, {Component} from "react";

export class ValidationError extends Component{

	render(){
		if(this.props.errors){
			return <div>
			{ this.props.errors.map(err=>
				<p className="text-danger" key={err}>
					{err}
				</p>
			)}
			</div>
		}
		return null;
	}

}