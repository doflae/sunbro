import React, {Component} from "react";
import {Switch, Route, Redirect} from "react-router-dom"
import {connect} from "react-redux"
import {loadData} from "../data/ActionCreators"
import {authWrapper} from "../auth/AuthWrapper"
import {Thumbnail} from "./Thumbnail"
const mapStateToProps = (dataStore) => ({
    ...dataStore
})

const mapDispatchToProps = {
    loadData
}

export const ContextConnector = authWrapper(connect(mapStateToProps, mapDispatchToProps)(
    class extends Component{
        constructor(){
            super()

            this.state = {
                contextList : [],
                last_board:0,
                user:null,
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
            const {last_board,contextList} = this.state;
            var resturl = '/board/recently?'
            if(last_board!==0){
                resturl+=`board_id=${last_board}`
            }
            this.props.request('get',resturl).then(res=>{
                this.setState({
                    contextList:[...contextList, ...res.data.list],
                    last_board:res.data.list[res.data.list.length-1]['id']
                })
            })
        }

        infiniteScroll = () => {
            const { documentElement, body } = document;

            const scrollHeight = Math.max(documentElement.scrollHeight, body.scrollHeight);
            const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
            const clientHeight = documentElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight) {
                this.setState({
                    preItems: 10,
                });
                this.getData();
            }
        }
        render(){
            const contextList = this.state.contextList;
            return <Switch>
                <Route path="/contexts"
                render={(routeProps)=>
                <Thumbnail {...this.props}{...routeProps}
                contexts={contextList}/>}/>
                <Redirect to="/contexts"/>
            </Switch>
        }

    }
))