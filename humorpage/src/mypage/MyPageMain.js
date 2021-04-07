import React, {Component} from "react";
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import MyBoardConnector from  "./MyBoardConnector"
class MyPageMain extends Component{
    constructor(props){
        super(props);

        this.state = {
            boardList:{0:[],1:[]},
            checkedBox:new Set(),
            boards:null,
            pagenum:1,
            target:null
        }
        this.total_num = this.props.total_num
        this.last_page = Math.ceil(this.total_num/this.props.pagesize)
        this.goNext = this.goNext.bind(this)
        this.goPrev = this.goPrev.bind(this)

        this.refreshPage = this.refreshPage.bind(this)
    }
    componentDidMount(){
        this.getData(1);
        console.log(this.last_page)
    }

    getData = (pagenum) => {
        const {boardList} = this.state;
        const option = this.props.option;
        if(boardList.includes(pagenum)){
            this.setState({
                boards:boardList[option][pagenum],
                pagenum:pagenum,
            })
        }else if(pagenum>0){
            let resturl;
            console.log(option)
            if(option===0){
                resturl = `/user/board?num=${pagenum-1}&size=${this.props.pagesize}`
            }
            else if(option===1){
                resturl = `/user/likes?num=${pagenum-1}&size=${this.props.pagesize}`
            }
            this.props.request("get", resturl).then(res=>{
                const resData = res.data.list
                if(res.data.success===true){
                    if(resData.length>0){
                        boardList[option][pagenum]=[...resData]
                        this.setState({
                            boardList:boardList,
                            boards:boardList[option][pagenum],
                            pagenum:pagenum
                        })
                    }
                }
            })
        }
    }

    pagnation = (pagenum) => (e) =>{
        this.getData(pagenum)
    }

    refreshPage = (pagenum) =>{
        const {boardList} = this.state;
        const resturl = `/user/board?num=${pagenum-1}&size=${this.props.pagesize}`
        this.props.request("get", resturl).then(res=>{
            console.log(res)
            const resData = res.data.list
            if(res.data.success===true){
                boardList[pagenum]=[...resData]
                this.setState({
                    boardList:boardList,
                    boards:boardList[pagenum],
                    pagenum:pagenum
                })
            }
        })
    }
    
    goPrev = () => (e)=> {
        const {pagenum} = this.state
        let prevnum = pagenum-5>0?pagenum-5:1
        if(pagenum!==prevnum)this.getData(prevnum)
        
    }

    goNext = () => (e)=> {
        const {pagenum} = this.state
        let nextnum = pagenum+5<this.last_page?pagenum+5:this.last_page
        if(pagenum!==nextnum)this.getData(nextnum)
    }

    render(){
        const boards = this.state.boards
        const num_list = [];
        const now_number = this.state.pagenum
        for(let i=now_number-4;i<now_number+5;i++){
            if(i>0 && i<=this.last_page){
                if(i===now_number){
                    num_list.push(<a href="# " className="mypage_pagenum mypage_page_on" key={i} value={i} 
                    onClick={this.pagnation(i)}>{i}</a>)
                }else{
                    num_list.push(<a href="# " className="mypage_pagenum" key={i} value={i} 
                    onClick={this.pagnation(i)}>{i}</a>)
                }
            }
        }
        return <div className="mypage_main">
            <MyBoardConnector boards={boards} refreshPage={this.refreshPage}
             pagenum={this.state.pagenum} option={this.props.option}
             goNext={this.goNext} goPrev={this.goPrev}
             num_list={num_list}/>
        </div>
    }
}

export default withRouter(authWrapper(MyPageMain))