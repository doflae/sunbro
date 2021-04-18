import styled from "styled-components"
import {IconStyled} from "../MainStyled"

export const RecommentStyled = styled.div`
    padding-top: 10px;
    margin-top: 10px;
    border-top: solid gainsboro 1px;
    display:flex;
`

export const CommentUserImageStyled = styled.img`
	max-width: 32px;
	max-height: 32px;
	border-radius: 16px;
	margin: 0px 10px 10px 5px;
`

export const CommentDeleteBtnStyled = styled.button`
	background-color: #e8e8e8;
	height: fit-content;
	cursor: pointer;
	border: none;
	margin-left:5px;
`
export const CommentMainStyled = styled.div`
	border-radius: 5px;
	background-color: #e9e9e9;
	padding: 10px;
	width:fit-content;
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
	font-weight: 500;
	margin-right: 10px;
`

export const CommentRightStlyed = styled.div`
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

export const RecommentBtnStyled = styled.button`
	background-color: #e8e8e8;
	height: fit-content;
	cursor: pointer;
	border: none;
`

export const CommentImgStyled = styled.img`
	margin-top: 5px;
`
export const CommentContextStyled = styled.div`
	padding-top:5px;
	& *{
		white-space:pre-wrap;
	}
`