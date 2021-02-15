import React, {Component} from "react";
import {Switch, Route, Redirect} from "react-router-dom"
import {connect} from "react-redux"
import {loadData} from "../data/ActionCreators"
import {authWrapper} from "../auth/AuthWrapper"
import {Thumbnail} from "./Thumbnail"
import Axios from "axios"
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
            if(last_board===0){
                this.props.request('get',resturl).then(res=>{
                    console.log(res)
                    if("user" in res.headers){
                        console.log(res.headers['user'])
                        this.setState({
                            user:JSON.parse(res.headers['user']),
                        })
                    }
                    this.setState({
                        contextList:[...contextList, ...res.data.list]
                    })
                })
            }
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