import * as axios from "axios";

export async function uploadContent(params){
    return axios.post("/board/form",params);
}