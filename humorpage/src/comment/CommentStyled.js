import styled from "styled-components"
import {IconStyled} from "../MainStyled"



export const RecommentOnIcon = styled(IconStyled)`
	filter:invert(53%) sepia(74%) saturate(1309%) hue-rotate(177deg) brightness(89%) contrast(91%);
`

export const RecommentOffIcon = styled(IconStyled)``

export const RecommentBox = styled.div`
	width:calc(100% - 80px);
	margin-left:auto;
	margin-right:15px;
	position:relative;
`

export const RecommentStyled = styled.div`
	margin-bottom:10px;
    display:flex;
`

export const SeeMoreBtnStyled = styled.div`
	margin:5px;
	opacity:0.5;
	cursor:pointer;
	&:hover {
		opacity:1;
		text-decoration:underline;
	}
`

export const CommentUserImageStyled = styled.img`
	max-width: 32px;
	max-height: 32px;
	border-radius: 16px;
	margin: 0px 10px 10px 5px;
`

export const CCBtnStyled = styled.div`
	position: absolute;
	background-color: #e9e9e9;
	top: 5px;
	right: 2px;
    width: 20px;
    height: 20px;
	cursor:pointer;
	border-radius:50%;
	&:hover{
		background-color:#b9b9b9;
	}
`

export const CCBtnIconStyled = styled.div`
	background-color:#000;
	position: relative;
    top: 8px;
	width:3px;
	height:3px;
	border-radius:50%;
	margin:auto;
	&::before, &::after{
		background-color:#000;
		content:" ";
		position:absolute;
		display:inline-block;
		width:3px;
		height:3px;
		border-radius:50%;
	}

	&::before{
		top:-6px;
	}

	&::after{
		top:6px;
	}
`

export const CCBoxOnLeftStyled = styled.div`
	position: absolute;
	top: 6px;
	right: 18px;
	background-color: #f9f9f9;
	width: 40px;
	height: 40px;
	border-radius: 5px;
    box-shadow: 0px 1px 1px 0px rgb(0 0 0 / 24%);
	&::before{
		content: "";
		border-bottom: 5px solid transparent;
		border-top: 0px solid transparent;
		border-right: 5px solid transparent;
		border-left: 5px solid #f9f9f9;
		position: absolute;
		top: 6px;
		right: -10px;
	}
`

export const CCBoxOnRightStyled = styled.div`
	position: absolute;
	top: 6px;
	right: -38px;
	background-color: #f9f9f9;
	width: 40px;
	border-radius: 5px;
	box-shadow: 0px 1px 1px 0px rgb(0 0 0 / 24%);
	height: 40px;
	&::before{
		content: "";
		border-bottom: 5px solid transparent;
		border-top: 0px solid transparent;
		border-right: 5px solid #f9f9f9;
		border-left: 5px solid transparent;
		position: absolute;
		top: 6px;
		right: 40px;
	}
`

export const CCStyled = styled.div`
	font-size: 1.1em;
	text-align: center;
	border-bottom: ${props=>props.isBottom?"":"1px solid rgb(0,0,0,0.24);"}
	margin: 1px 4px;
`

export const CommentMainStyled = styled.div`
	border-radius: 5px;
	background-color: #e9e9e9;
	padding: 10px;
	width:fit-content;
	max-width:70%;
	position:relative;
	&:after{
		content: " ";
		border-left: solid 10px transparent;
		border-right: solid 10px #e9e9e9;
		border-bottom: solid 15px transparent;
		border-top: solid 4px transparent;
		position: absolute;
		left: -19px;
		top: 12px;
	}
`

export const CommentSubsciprtStyled = styled.div`
	font-size: 0.8em;
	padding-top: 2px;
	margin-right:5px;
	display:flex;
`

export const CommentLeftStyled = styled.div`
	display:flex;
	position:relative;
`

export const CommentAuthorStyled = styled.div`
	font-weight: 700;
	margin-right: 10px;
`

export const CommentOptionStlyed = styled.div`
	right: 0;
	float: right;
	margin-left: auto;
	display:flex;
`

export const LikeStyled = styled.div`
	display:flex;
	line-height:24px;
	font-size:1.1em;
`

export const NumberStyled = styled.div`
	margin-left:3px
`

export const LikeBtnStyled = styled(IconStyled)`
 filter:${props=>props.color};
`

export const CommentStyled = styled.div`
	margin-left: 30px;
	margin-right: 30px;
	padding-top: 10px;
	padding-bottom: 10px;
	display: flex;
`

export const RecommentBtnStyled = styled.div`
	height: 24px;
	display:flex;
	margin-left:5px;
	cursor: pointer;
`

export const CommentImgStyled = styled.img`
	margin-top: 5px;
`
export const CommentContextStyled = styled.div`
	padding-top:5px;
	& *{
		word-break:break-all;
	}
`