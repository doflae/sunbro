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

export const CommentDeleteBtnStyled = styled.div`
	background-color: #e8e8e8;
	height: fit-content;
	cursor: pointer;
	margin-left:auto;
	width:18px;
	height:18px;
	border-radius:50%;
	position: relative;
    right: -6px;
    top: -6px;
	&:hover{
		background-color:#d8d8d8;
	}
`

export const CommentDeleteBtnIconStyled = styled.div`
	background-color:#000;
	width:3px;
	height:3px;
	position:relative;
	border-radius:50%;
	top:8px;
	right:-1px;
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