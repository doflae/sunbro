import React, {Component} from "react";

export class ValidationSuccess extends Component{

	render(){
		if(this.props.success){
            return <p className="text-success">
                {this.props.success}
            </p>
		}
		return null;
	}

}