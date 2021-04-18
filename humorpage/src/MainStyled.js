import styled from "styled-components"
import Icons from "./static/img/Icons.png"

const IconSize = {
    "like_lg":32,
    "camera_lg":32,
    "comment_lg":32,
    "search_lg":32,
    "pencil_lg":32,
    "share_lg":32,
    "like_sm":24,
    "image_sm":24,
    "comment_sm":24,
    "video_sm":24,
    "youtube_sm":24,
    "pencil_sm":16
}

const IconPos = {
    "like_lg":"0px 0px",
    "camera_lg":"-32px 0px",
    "comment_lg":"-64px 0px",
    "search_lg":"-96px 0px",
    "pencil_lg":"-128px 0px",
    "share_lg":"-160px 0px",
    "like_sm":"0px -32px",
    "image_sm":"-24px -32px",
    "comment_sm":"-48px -32px",
    "video_sm":"-72px -32px",
    "youtube_sm":"-96px -32px",
    "pencil_sm":"-120px -32px"
}

export const IconStyled = styled.div`
    cursor:pointer;
    background-image:url(${Icons});
    width:${props=>IconSize[props.theme]}px;
    height:${props=>IconSize[props.theme]}px;
    background-repeat: no-repeat;
    background-position:${props=>IconPos[props.theme]};
`