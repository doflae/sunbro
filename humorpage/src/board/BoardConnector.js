import React, { Component } from 'react';
import {WindowScroller, CellMeasurer, CellMeasurerCache, AutoSizer, List} from 'react-virtualized';
import Board from "./Board";
import {authWrapper} from "../auth/AuthWrapper"
import styled from "styled-components"
import {IconStyled} from "../MainStyled"
import {uploadWrapper} from "../upload/UploadWrapper"
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
        this.changeMode = this.changeMode.bind(this)
        this.baseUrl = "/board/recently?"
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

    changeMode = (url) =>{
        this.baseUrl = url
        this.lastBoard = 0
        this.setState({
            boards:[]
        },this.getBoard)
        window.scrollTo({top:0,behavior:"auto"})
    }

    getBoard = throttle(() =>{
        let resturl = this.baseUrl
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
            <BoardZoneHeader changeMode = {this.changeMode}/>
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

const menus = [{
  name:"NEW",url:"/board/recently?",theme:"new_lg"
},{
  name:"HOT",url:"/board/rank/DAY?",theme:"hot_lg"
},{
  name:"TOP",url:"/board/rank/WEEK?",theme:"top_lg"
}]

const BoardZoneHeader = authWrapper(uploadWrapper(({changeMode,...props}) =>{
    const goUpload = () =>{
        if(props.user) props.onOffUploadPage(0);
        else props.setAuthPageOption(0);
    }
    const renderBtn = () =>{
        return menus.map((menu,key)=>{
            <HeaderBtnStyled key = {key}
                onClick={()=>{changeMode(menu.url)}}>
                <BoardIconStyled theme={menu.theme}/>
            {menu.name}
            </HeaderBtnStyled>
        })
    }
    return <BoardZoneHeaderStyled>
        <HeaderBtnLeftZone>
        {renderBtn()}
        </HeaderBtnLeftZone>
        <HeaderBtnRightZone>
            <HeaderBtnStyled>
            <PencilStyled 
                theme="pencil_lg"
                onClick={goUpload}/>
            </HeaderBtnStyled>
        </HeaderBtnRightZone>
    </BoardZoneHeaderStyled>
}))

const ObserverBoxStyled = styled.div`
    height:300px;
    width:100%;
`

const BoardMainBoxStyled = styled.div`
    min-width: 496px;
    max-width: 700px;
    margin-left:auto;
`

const BoardIconStyled = styled(IconStyled)`
    margin-right:5px;
`

const PencilStyled = styled(IconStyled)`
  align-self: center;
  cursor:pointer;
  filter: invert(37%) sepia(90%) saturate(577%) hue-rotate(
  185deg
  ) brightness(98%) contrast(85%);
`

const HeaderBtnStyled = styled.div`
    width: 100%;
    font-weight: 700;
    line-height: 32px;
    font-size: 1.2em;
    height: 100%;
    display: flex;
    cursor:pointer;
    margin: 0px 5px;
`
const HeaderBtnLeftZone = styled.div`
    width:fit-content;
    float:left;
    height:100%;
    display:flex;
`
const HeaderBtnRightZone = styled.div`
    width:fit-content;
    float:right;
    height:100%;
    display:flex;
`


const BoardZoneHeaderStyled = styled.div`
    min-width: 496px;
    max-width: 700px;
    padding: 8px;
    height: 50px;
    border-radius: 10px;
    margin-left: auto;
    background-color: #f9f9f9;
    border-bottom: 1px solid rgba(94,93,93,0.418);
    margin-bottom: 4px;
    box-shadow: rgb(0 0 0 / 24%) 0px 2px 2px 0px, rgb(0 0 0 / 24%) 0px 0px 1px 0px;
`

const NextBoardBtnStyled = styled.div`
    position: sticky;
    color: #fff;
    font-weight: 600;
    cursor: pointer;
    font-size: 1.2em;
    padding-left: 10px;
    bottom: 25px;
    margin-left: calc(100% - 105px);
    width: 100px;
    height: 30px;
    border-radius: 10px;
    background-color: rgb(41, 128, 185);
`

const DownIconStyled = styled.div`
    position: absolute;
    right: 14px;
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