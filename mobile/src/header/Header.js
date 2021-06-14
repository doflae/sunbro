import React, { useEffect, useRef, useState } from 'react';
import { withRouter,useHistory} from "react-router-dom";
import { authWrapper } from '../auth/AuthWrapper';
import { boardWrapper} from "../board/BoardWrapper";
import userDefaultImg from "../static/img/userDefault.png";
import styled from "styled-components";

function Header({...props}){
  let history = useHistory();
  const [user,setUser] = useState(props.user);
  const headClick = () => {
    history.push("/")
    history.go("/")
  }
  const goMyMenu = () =>{
    const ref = props.myMenuBtnRef.current
    if(ref){
      ref.style.width="60%"
    }
  }
  useEffect(()=>{
    setUser(props.user);
  },[props.user,user])

  return <HeadStyled>
  <OrderBtnZone/>
  <HeadLogoStyled 
  left={document.body.clientWidth * 0.3}
  onClick={headClick}>
    NOGARY
  </HeadLogoStyled>
  <MyMenuBtn user = {user} goMyMenu={goMyMenu}/>
  </HeadStyled>
}

const menus = [{
  name:"NEW",url:"/board/recently?"
},{
  name:"HOT",url:"/board/rank/DAY?"
},{
  name:"TOP",url:"/board/rank/WEEK?"
}]

const OrderBtnZone = boardWrapper(({...props}) =>{
  const [nowMenu,setNowMenu] = useState("NEW")
  const [onOff, setOnOff] = useState(false)

  const renderDropMenu = () =>{
    if(onOff){
      return menus.map((menu,key)=>{
        if(menu.name!==nowMenu){
          return <OrderBtnStyled key={key}
          onClick={()=>{
            props.setBoardUrl(menu.url);
            setNowMenu(menu.name);
            setOnOff(false);}}>
          {menu.name}
          </OrderBtnStyled>
        }
      })
    }
  }

  return <DropDownOrderBtnStyled

      onBlur={()=>{
        setOnOff(false)
      }}
      onClick={()=>{
        setOnOff(!onOff)
      }}
    >
    <OrderTopBtnStyled>
    {nowMenu}
    </OrderTopBtnStyled>
    {renderDropMenu()}
  </DropDownOrderBtnStyled>
})

const MyMenuBtn = ({user, goMyMenu}) =>{
  if(user!=null){
    return <UserImgStyled src={user.userImg}
    onClick={goMyMenu}
    alt="" onError={(e)=>{e.target.onerror=null; e.target.src=userDefaultImg}}/>
  }else{
    return <UserImgStyled 
    onClick={goMyMenu}
    src={userDefaultImg} alt=""/>
  }
}

const UserImgStyled = styled.img`
  cursor:pointer;
  width: 32px;
  height: 32px;
  margin: 8px;
`

const DropDownOrderBtnStyled = styled.div`
  cursor:pointer;
  position:relative;
  margin: 8px;
  height: fit-content;
  background-color: #fff;
  border-radius: 15px;
`

const OrderTopBtnStyled = styled.div`
  border: solid 2px rgb(0,0,0,0.24);
  border-radius: 10px;
  height: 34px;
  width: 65px;
  position: relative;
  padding: 2px 4px;
  font-size: 16px;
  font-weight: 600;
  &::after{
    content: "";
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 10px 7px 0 7px;
    border-color: black transparent transparent transparent;
    position: absolute;
    right: 4px;
    top: 10px;
  }
`

const OrderBtnStyled = styled.div`
  border: solid 2px rgb(0,0,0,0.24);
  margin-top: 5px;
  border-radius: 10px;
  height: 34px;
  width: 65px;
  position: relative;
  padding: 2px 4px;
  text-align:center;
  font-size: 16px;
  font-weight: 600;
`

const HeadLogoStyled = styled.div`
  font-size: 32px;
  position: absolute;
  width:40%;
  text-align:center;
  left: ${props=>props.left}px;
  font-weight: 800;
  cursor: pointer;
`

const HeadStyled = styled.header`
  z-index:2;
  width: 100%;
  height: 50px;
  background-color : #fff;
  border-bottom: solid 1px rgb(0 0 0 / 36%);
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  position:fixed;
`

export default withRouter(authWrapper(Header));