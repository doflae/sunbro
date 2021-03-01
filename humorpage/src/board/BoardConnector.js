import React, {Component} from "react";
import {Switch, Route, Redirect} from "react-router-dom"
import {connect} from "react-redux"
import {loadData} from "../data/ActionCreators"
import {authWrapper} from "../auth/AuthWrapper"
import Board from "./Board"
const mapStateToProps = (dataStore) => ({
    ...dataStore
})

const mapDispatchToProps = {
    loadData
}

export const BoardConnector = authWrapper(connect(mapStateToProps, mapDispatchToProps)(
    class extends Component{
        constructor(){
            super()

            this.state = {
                boardList : [],
                last_board:0,
            };
        }

        componentDidMount(){
            this.getData();
            window.addEventListener('scroll', this.infiniteScroll);
        }
        
        componentWillUnmount(){
            window.removeEventListener('scroll', this.infiniteScroll);
        }


        getData = () => {
            const {last_board,boardList} = this.state;
            var resturl = '/board/recently?'
            if(last_board!==0){
                resturl+=`board_id=${last_board}`
            }
            this.props.request('get',resturl).then(res=>{
                const resData = res.data.list
                if(resData.length>0){
                    this.setState({
                        boardList:[...boardList, ...resData],
                        last_board:resData[resData.length-1]['id']
                    })
                }else{
                    window.removeEventListener('scroll', this.infiniteScroll);
                }
            })
        }

        infiniteScroll = () => {
            const { documentElement, body } = document;

            const scrollHeight = Math.max(documentElement.scrollHeight, body.scrollHeight);
            const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
            const clientHeight = documentElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight) {
                this.getData();
            }
        }
        render(){
            const boardList = this.state.boardList;
            return <Switch>
                <Route path="/boards"
                render={(routeProps)=>
                <Board {...this.props}{...routeProps}
                boards={boardList}/>}/>
                <Redirect to="/boards"/>
            </Switch>
        }

    }
))