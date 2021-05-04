import React, { Component } from 'react';
import {WindowScroller, CellMeasurer, CellMeasurerCache, AutoSizer, List} from 'react-virtualized';
import Board from "./Board";
import {authWrapper} from "../auth/AuthWrapper"
import styled from "styled-components"
import {IconStyled} from "../MainStyled"
import {uploadWrapper} from "../upload/UploadWrapper"
import {throttle} from "../utils/Utils"
import {boardWrapper} from "./BoardWrapper"

export const cache = new CellMeasurerCache({
    defaultWidth:100,
    fixedWidth:true
})

class BoardConnector extends Component{
    constructor(props){
        super(props);
        this.listRef = React.createRef();
        this.boardElements = [];
        this.lastBoard = 0;
        this.lastElementid = 0;
        this.lastIndex = 0;
        this.state = {
            boards:[]
        };
        this.clear = this.clear.bind(this)
        this.registerRef = this.registerRef.bind(this)
    }

    registerRef = (elem) =>{
        if(elem!==null){
            this.boardElements.push(elem)
        }
    }

    gotoNext = () =>(e)=> {
        const {documentElement, body} = document;
        const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
        const scrollBottom = scrollTop+documentElement.clientHeight
        for(let i = this.lastElementid+1; i<this.boardElements.length;i++){
            const b = this.boardElements[i]
            const offsetTop = b.offsetTop
            if(offsetTop+b.offsetHeight<scrollBottom) continue
            this.lastElementid = i
            window.scrollTo({top:offsetTop+50, behavior:'smooth'})
            return
        }
    }

    getBoard = () =>{
        let resturl = `/board/recently?`
        if(this.lastBoard!==0){
            resturl+=`board_id=${this.lastBoard}`
        }
        const {boards} = this.state
        this.props.request('get',resturl).then(res=>{
            const resData = res.data.list
            if(0<resData.length && resData.length<11){
                this.setState({
                    boards:[...boards,...resData]
                })
                this.lastBoard = resData[resData.length-1]['id']
            }else{
                window.removeEventListener("scroll",throttle(this.infiniteScroll,300))
            }
        })
    }

    infiniteScroll = () => {
        const { documentElement, body } = document;

        const scrollHeight = Math.max(documentElement.scrollHeight, body.scrollHeight);
        const scrollTop = Math.max(documentElement.scrollTop, body.scrollTop);
        const clientHeight = documentElement.clientHeight;
        if (scrollTop + clientHeight >= scrollHeight) {
            this.getBoard();
        }
    }
    
    nextBtnRenderer = () =>{
        const {boards} = this.state
        if(boards.length===0) return null;
        return <NextBoardBtnStyled onClick={this.gotoNext()}>
            NEXT
            <DownIconStyled/>
        </NextBoardBtnStyled>
    }

    clear = () =>{
        cache.clearAll();
    }

    rowRenderer = ({ index, key, parent, style }) => {
        this.lastIndex = Math.max(index,this.lastIndex)
        const {boards} = this.state
        return (
            <CellMeasurer cache={cache} parent={parent} key={key} columnIndex={0} rowIndex={index}>
                {({measure})=>(
                    <Board
                    board={boards[index]} 
                    measure={measure}
                    clear={this.clear}
                    style={style}
                    setRef={this.registerRef}/>
                )}
            </CellMeasurer>
        );
    };

    componentDidMount(){
        this.getBoard()
        window.addEventListener("scroll",throttle(this.infiniteScroll,300))
    }

    componentWillUnmount(){
        window.removeEventListener("scroll",throttle(this.infiniteScroll,300))
    }

    render(){
        const {boards} = this.state
        return (
        <React.Fragment>
            <BoardZoneHeader/>
            <BoardMainBoxStyled>
                <WindowScroller>
                    {({ height, scrollTop, isScrolling, onChildScroll }) => (
                        <AutoSizer disableHeight>
                            {({ width }) => (
                                <List
                                    ref={this.listRef}
                                    autoHeight
                                    height={height}
                                    width={width}
                                    isScrolling={isScrolling}
                                    overscanRowCount={0}
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
        </React.Fragment>
        );
    }
}

const BoardZoneHeader = uploadWrapper(({...props}) =>{
    const goUpload = () => (e) =>{
      props.onOffUploadPage(0);
    }
    return <BoardZoneHeaderStyled>
        <HeaderBtnLeftZone>
            <HeaderBtnStyled>
                <BoardIconStyled
                theme="hot_lg"
                />
                HOT
            </HeaderBtnStyled>
            <HeaderBtnStyled>
                <BoardIconStyled
                theme="new_lg"
                />
                NEW
            </HeaderBtnStyled>
            <HeaderBtnStyled>
                <BoardIconStyled
                theme="rank_lg"
                />
                TOP
            </HeaderBtnStyled>
        </HeaderBtnLeftZone>
        <HeaderBtnRightZone>
            <HeaderBtnStyled>
            <PencilStyled 
                theme="pencil_lg"
                onClick={goUpload()}/>
            </HeaderBtnStyled>
        </HeaderBtnRightZone>
    </BoardZoneHeaderStyled>
})

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