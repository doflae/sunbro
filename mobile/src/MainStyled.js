import styled from "styled-components"
import Icons from "./static/img/Icons.png"

const IconSize = {
    "like_lg":32,
    "camera_lg":32,
    "comment_lg":32,
    "search_lg":32,
    "pencil_lg":32,
    "share_lg":32,
    "new_lg":32,
    "hot_lg":32,
    "top_lg":32,
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
    "new_lg":"-192px 0px",
    "hot_lg":"0px -32px",
    "top_lg":"-32px -32px",
    "like_sm":"-64px -32px",
    "image_sm":"-88px -32px",
    "comment_sm":"-112px -32px",
    "video_sm":"-136px -32px",
    "youtube_sm":"-160px -32px",
    "pencil_sm":"-184px -32px"
}

export const IconStyled = styled.div`
    cursor:pointer;
    background-image:url(${Icons});
    width:${props=>IconSize[props.theme]}px;
    height:${props=>IconSize[props.theme]}px;
    background-repeat: no-repeat;
    background-position:${props=>IconPos[props.theme]};
`