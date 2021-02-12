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
                items: 10,
                preItems: 0,
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
            const {preItems, items, contextList} = this.state;
            var resturl = '/board/recently?'
            if(preItems===0){
                
            }
            fetch(resturl)
            .then((res) => res.json())
            .then( data =>{
                let result = data
                this.setState({
                    contextList:[...contextList, ...result],
                });
            });
        }

        infiniteScroll = () => {
            const { documentElement, body } = document;
            const { items } = this.state;

            const scrollHeight = Math.max(documentElement.scrollHeight, body.scrollHeight);
            const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
            const clientHeight = documentElement.clientHeight;

            if (scrollTop + clientHeight >= scrollHeight) {
                this.setState({
                    preItems: items,
                    items: items + 10,
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