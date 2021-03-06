import React, { Component } from 'react';
import {WindowScroller, CellMeasurer, CellMeasurerCache, AutoSizer, List} from 'react-virtualized';
import Board from "./Board";
import {authWrapper} from "../auth/AuthWrapper"
import styled from "styled-components"
import {boardWrapper} from "./BoardWrapper"
import { observeTrigger,throttle } from '../utils/Utils';

export const cache = new CellMeasurerCache({
    defaultWidth:100,
    fixedWidth:true
})

class BoardConnector extends Component{
    constructor(props){
        super(props);
        this.listRef = React.createRef();
        this.observer = React.createRef();
        this.mainBoxRef = React.createRef();
        this.lastBoard = 0;
        this.lastElementid = 0;
        this.lastIndex = 0;
        this.state = {
            boards:[]
        };
        this._measureCallbacks = {}
        this._remeasure = this._remeasure.bind(this)
        this.boardUrl = this.props.match.params.key?
        `/board/user?userNum=${this.props.match.params.key}`:
        this.props.boardUrl
    }

    componentDidUpdate(prev){
        if(prev.boardUrl !== this.props.boardUrl){
            this.lastBoard = 0
            this.setState({
                boards:[]
            },this.getBoard)
            window.scrollTo({top:0,behavior:"auto"})
        }
    }

    gotoNext = () => {
        const {documentElement, body} = document;
        const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
        const scrollBottom = scrollTop+documentElement.clientHeight
        const onBoard = this.mainBoxRef.current.querySelectorAll(".ng-board-main")
        let l = 0, r = onBoard.length
        while (l<r){
            let mid = (l+r)>>1
            let b = onBoard[mid]
            let offsetTop = b.offsetTop
            if(offsetTop+b.offsetHeight<scrollBottom) l = mid+1
            else r = mid
        }
        const t = onBoard[l]
        window.scrollTo({top:t.offsetTop+t.offsetHeight+50,behavior:"smooth"})
    }

    getBoard = throttle(() =>{
        let resturl = this.boardUrl
        if(this.lastBoard!==0){
            resturl+=`lastId=${this.lastBoard}`
        }
        const {boards} = this.state
        this.props.request('get',resturl).then(res=>{
            const resData = res.data.list
            console.log(res)
            if(0<resData.length && resData.length<6){
                this.setState({
                    boards:[...boards,...resData]
                })
                this.lastBoard = resData[resData.length-1]['id']
            }
        })
    })

    
    nextBtnRenderer = () =>{
        const {boards} = this.state
        if(boards.length===0) return null;
        return <NextBoardBtnStyled onClick={this.gotoNext}>
            NEXT
            <DownIconStyled/>
        </NextBoardBtnStyled>
    }

    _remeasure = (idx) =>{
        if(idx in this._measureCallbacks){
            this._measureCallbacks[idx]();
            this.listRef.current.recomputeRowHeights(idx)
        }else{
            for(let i = idx;i<cache._rowCount;i++){
                cache.clear(i,0)
            }
        }
    }

    rowRenderer = ({ index, key, parent, style }) => {
        const {boards} = this.state
        const callbackMeasure = measure =>{
            this._measureCallbacks[index] = measure
        }
        return (
            <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
                {({measure})=>{
                    callbackMeasure(measure);
                    return <Board
                    board={boards[index]}
                    idx = {index}
                    measure={this._remeasure}
                    style={style}/>
                }}
            </CellMeasurer>
        );
    };

    componentDidMount(){
        this.getBoard()
        if(this.observer.current){
            observeTrigger(this.getBoard,this.observer.current);
        }
    }

    render(){
        const {boards} = this.state
        return (
        <React.Fragment>
            <BoardMainBoxStyled ref={this.mainBoxRef}>
                <WindowScroller>
                    {({ height, scrollTop, isScrolling, onChildScroll }) => (
                        <AutoSizer disableHeight>
                            {({ width }) => (
                                <List
                                    ref={this.listRef}
                                    autoHeight
                                    height={height*3}
                                    width={width}
                                    isScrolling={isScrolling}
                                    overscanRowCount={5}
                                    onScroll={onChildScroll}
                                    scrollTop={scrollTop}
                                    rowCount={boards.length}
                                    rowHeight={cache.rowHeight}
                                    rowRenderer={this.rowRenderer}
                                    deferredMeasurementCache={cache}
                                />
                            )}
                        </AutoSizer>
                    )}
                </WindowScroller>
            </BoardMainBoxStyled>
            {this.nextBtnRenderer()}
            <ObserverBoxStyled
            ref={this.observer}
            />
        </React.Fragment>
        );
    }
}

const ObserverBoxStyled = styled.div`
    height:300px;
    width:100%;
`

const BoardMainBoxStyled = styled.div`
    width:100%;
`
const NextBoardBtnStyled = styled.div`
    position: sticky;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    font-size: 18px;
    padding-left: 10px;
    bottom: 25px;
    margin: 0px 5px 0px auto;
    width: 90px;
    height: 30px;
    border-radius: 10px;
    background-color: rgb(41,128,185);
`

const DownIconStyled = styled.div`
    position: absolute;
    right: 12px;
    top: 7px;
    width: 10px;
    height: 10px;
    &::before{
        position: absolute;
        content: ' ';
        height: 15px;
        right: 0px;
        width: 5px;
        background-color: #fff;
        transform: rotate(45deg);
    }
    &::after{
        position: absolute;
        content: ' ';
        height: 15px;
        width: 5px;
        right: 7px;
        background-color: #fff;
        transform: rotate(-45deg);
    }
`

export default boardWrapper(authWrapper(BoardConnector));