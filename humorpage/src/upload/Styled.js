import styled from "styled-components"

export const BlurBackGroundStlyed = styled.div`
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
  top: 8px;
  right: 0px;
  width: 16px;
  height: 16px;
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
    left: -6px;
    bottom: -9px;
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