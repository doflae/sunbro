import React,{Component} from "react";
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"

class MyBoard extends Component{
    render(){
        if(this.props.boards === null || this.props.boards.length === 0){
            return <h5>작성한 글이 없습니다.</h5>
        }
        return this.props.boards.map(b =>
            <tr className="myboard" key={b.id}>
                <td>
                    글 선택
                </td>
                <td className="myboard_main">
                    <div className="myboard_title">
                        {b.title}
                    </div>
                    {this.props.contextOn?(
                        <div className="myboard_context">{b.context}</div>
                    ):null}
                </td>
                <td>
                    {b.created}
                </td>
                <td>
                    {b.likes}
                </td>
            </tr>
            )
    }
}

export default withRouter(authWrapper(MyBoard))