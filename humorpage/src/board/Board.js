import React, {Component} from "react";
import Thumbnail from "./Thumbnail";
class Board extends Component{        
    render(){
        if(this.props.boards == null || this.props.boards.length ===0){
            return <h5 className="p-2">No boards</h5>
        }
        return <div className="board_main">
            {this.props.boards.map(board =>{
                return <Thumbnail board={board} key={board.id}/>})}
        </div>
    }
}

export default React.memo(Board)

