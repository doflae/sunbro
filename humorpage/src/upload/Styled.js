import styled from "styled-components"
import Icons from "../static/img/Icons.png"

export const MainContentStyled = styled.div`

`
export const SubmitStyled = styled.button`
  background-color: #11698e;
  color: #fff;
  float: right;
  height: 2.5rem;
  width: 3.5rem;
  font-size: 1rem;
  margin: 5px 5px;
`

export const TitleInputStyled = styled.input`
  border-top: 0px;
  border-left: 0px;
  border-right: 0px;
  width: 80%;
  font-size: 1.5rem;
  font-weight: normal;
  border-bottom: 1px solid rgba(94, 93, 93, 0.418);
`


export const MyCustomIconStyled = styled.div`
  background-image:url(${Icons});
  width:24px;
  height:24px;
  background-repeat: no-repeat;
  background-position: -72px -32px;
`

export const QlVideoIconStyled = styled.div`
  background-image:url(${Icons});
  width:24px;
  height:24px;
  background-repeat: no-repeat;
  background-position: -96px -32px;
`

export const BlurBackGroundStyled = styled.div`
  position: fixed;
  z-index: 1;
  background-color: rgb(0,0,0,65%);
  top: 0px;
  width: 100%;
  height: 100%;
`

export const TitleZoneStyled = styled.div`
  padding: 10px;
  padding-top: 10px;
  padding-bottom: 10px
`

export const DeleteBtnStyled = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 30px;
  height: 30px;
  border-radius: 18px;
  border: 0px;
  opacity: 0.4;
  z-index: 1;
  background-color: #fff;
  &:hover{
      opacity:1;
  }
  &::before, &::after{
    position: absolute;
    left: 13px;
    bottom: 1px;
    content: ' ';
    height: 28px;
    width: 3px;
    background-color: #333;
  }
  &::before{
      transform: rotate(45deg);
  }
  &::after{
      transform: rotate(-45deg);
  }
`

export const UploadBoxStyled = styled.div`
  position: fixed;
  background-color: #fff;
  top:60px;
  width: 500px;
  left: calc(50% - 250px);
  z-index: 1;
  box-shadow: 0px 0px 3px 2px rgb(0 0 0 / 24%);
  border-radius: 5px;
`