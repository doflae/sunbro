import React, {useEffect, useState} from "react";
import {withRouter} from "react-router-dom"
import {authWrapper} from "../auth/AuthWrapper"
import MyBoardConnector from  "./MyBoardConnector"
import styled from "styled-components";

// class MyPageMain extends Component{
//     constructor(props){
//         super(props);

//         this.state = {
//             boardList:{0:[],1:[]},
//             checkedBox:new Set(),
//             pageNumSet:{0:1,1:1},
//             target:null
//         }
//         this.total_num = {
//             0:this.props.total_board_num,
//             1:this.props.total_like_num
//         }
//         this.last_page = {
//             0:Math.ceil(this.props.total_board_num/this.props.pagesize),
//             1:Math.ceil(this.props.total_like_num/this.props.pagesize)
//         }
//         this.goNext = this.goNext.bind(this)
//         this.goPrev = this.goPrev.bind(this)

//         this.refreshPage = this.refreshPage.bind(this)
//     }
//     componentDidMount(){
//         this.getData(1);
//     }

//     getData = (pagenum) => {
//         const {boardList,pageNumSet} = this.state;
//         const option = this.props.option;
//         pageNumSet[option] = pagenum
//         if(boardList[option].includes(pagenum)){
//             this.setState({
//                 pageNumSet:pageNumSet,
//             })
//         }else if(pagenum>0){
//             let resturl;
//             if(option===0){
//                 resturl = `/user/board?num=${pagenum-1}&size=${this.props.pagesize}`
//             }
//             else if(option===1){
//                 resturl = `/user/likes?num=${pagenum-1}&size=${this.props.pagesize}`
//             }
//             this.props.request("get", resturl).then(res=>{
//                 const resData = res.data.list
//                 if(res.data.success===true){
//                     if(resData.length>0){
//                         boardList[option][pagenum]=[...resData]
//                         this.setState({
//                             boardList:boardList,
//                             pageNumSet:pageNumSet,
//                         })
//                     }
//                 }
//             })
//         }
//     }

//     pagnation = (pagenum) => (e) =>{
//         this.getData(pagenum)
//     }

//     refreshPage = (pagenum) =>{
//         const {boardList,pageNumSet} = this.state;
//         const option = this.props.option;
//         pageNumSet[option] = pagenum
//         const resturl = `/user/board?num=${pagenum-1}&size=${this.props.pagesize}`
//         this.props.request("get", resturl).then(res=>{
//             const resData = res.data.list
//             if(res.data.success===true){
//                 boardList[option][pagenum]=[...resData]
//                 this.setState({
//                     boardList:boardList,
//                     pageNumSet:pageNumSet
//                 })
//             }
//         })
//     }
    
//     goPrev = () => (e)=> {
//         const {pageNumSet} = this.state
//         const option = this.props.option;
//         const pagenum = pageNumSet[option]
//         let prevnum = pagenum-5>0?pagenum-5:1
//         if(pagenum!==prevnum)this.getData(prevnum)
        
//     }

//     goNext = () => (e)=> {
//         const {pageNumSet} = this.state
//         const option = this.props.option;
//         const pagenum = pageNumSet[option]
//         const last_page = this.last_page[option]
//         let nextnum = pagenum+5<last_page?pagenum+5:last_page
//         if(pagenum!==nextnum)this.getData(nextnum)
//     }

//     render(){
//         const option = this.props.option;
//         const pagenum = this.state.pageNumSet[option]
//         const boards = this.state.boardList[option][pagenum]
//         const num_list = [];
//         const last_page = this.last_page[option]
//         for(let i=pagenum-3;i<pagenum+4;i++){
//             if(i>0 && i<=last_page){
//                 if(i===pagenum){
//                     num_list.push(<a href="# " className="mypage_pagenum mypage_page_on" key={i} value={i} 
//                     onClick={this.pagnation(i)}>{i}</a>)
//                 }else{
//                     num_list.push(<a href="# " className="mypage_pagenum" key={i} value={i} 
//                     onClick={this.pagnation(i)}>{i}</a>)
//                 }
//             }
//         }
//         return <MyPageMainStyled>
//             <MyBoardConnector boards={boards} refreshPage={this.refreshPage}
//              pagenum={pagenum} option={option}
//              goNext={this.goNext} goPrev={this.goPrev}
//              num_list={num_list}/>
//         </MyPageMainStyled>
//     }
// }
const MyPageMain = ({...props}) =>{
    const [boardList, setBoardList] = useState({0:[],1:[]});
    const [pageNumSet, setPageNumSet] = useState({0:1,1:1});
    const [loading, setLoading] = useState(true);
    const pagesize = props.pagesize
    const option = props.option
    const lastPageSet = {
        0:Math.ceil(props.total_board_num/pagesize),
        1:Math.ceil(props.total_like_num/pagesize)
    }
    const getData = (pagenum) =>{
        pageNumSet[option] = pagenum;
        if(boardList[option][pagenum]!=null){
            setPageNumSet(pageNumSet)
        }else if(pagenum>0){
            setLoading(true)
            let resturl;
            if(option===0){
                resturl = `/user/board?num=${pagenum-1}&size=${pagesize}`
            }
            else if(option===1){
                resturl = `/user/likes?num=${pagenum-1}&size=${pagesize}`
            }
            props.request("get", resturl).then(res=>{
                console.log(res)
                if(res.data.success===true){
                    const resData = res.data.list
                    if(resData.length>0){
                        boardList[option][pagenum]=[...resData]
                        setBoardList(boardList)
                        setPageNumSet(pageNumSet)
                    }
                }
            }).then(()=>setLoading(false));
        }
    }
    
    useEffect(()=>{
        getData(1)
    },[props.option])

    const pagnation = (pagenum) => (e) =>{
        getData(pagenum)
    }

    const refreshPage = (pagenum) => {
        pageNumSet[option] = pagenum;
        setLoading(true)
        const resturl = `/user/board?num=${pagenum-1}&size=${pagesize}`
        props.request("get", resturl).then(res=>{
            if(res.data.success===true){
                const resData = res.data.list
                boardList[option][pagenum]=[...resData]
                setBoardList(boardList)
                setPageNumSet(pageNumSet)
            }
        }).then(()=>setLoading(false));
    }
    const goPrev = () => (e)=> {
        const pagenum = pageNumSet[option]
        let prevnum = pagenum-5>0?pagenum-5:1
        if(pagenum!==prevnum) getData(prevnum)
    }

    const goNext = () => (e)=> {
        const pagenum = pageNumSet[option]
        const lastPage = lastPageSet[option]
        let nextnum = pagenum+5<lastPage?pagenum+5:lastPage
        if(pagenum!==nextnum) getData(nextnum)
    }

    const pagenum = pageNumSet[option]
    const numList = [];
    const lastPage = lastPageSet[option];
    
    for(let i=pagenum-3;i<pagenum+4;i++){
        if(i>0 && i<=lastPage){
            if(i===pagenum){
                numList.push(<a href="# " className="mypage_pagenum mypage_page_on" key={i} value={i} 
                onClick={pagnation(i)}>{i}</a>)
            }else{
                numList.push(<a href="# " className="mypage_pagenum" key={i} value={i} 
                onClick={pagnation(i)}>{i}</a>)
            }
        }
    }
    if(loading) return null;
    return <MyPageMainStyled>
        <MyBoardConnector boards={boardList[option][pagenum]} refreshPage={refreshPage}
            pagenum={pagenum} option={option}
            goNext={goNext} goPrev={goPrev}
            num_list={numList}/>
    </MyPageMainStyled>
}

const MyPageMainStyled = styled.div`
    position: relative;
    padding:0px 5px;
`

export default withRouter(authWrapper(MyPageMain))