import * as axios from "axios"

export async function uploadFile(files, params) {
  return axios.post("/api/upload/local", files, params);
}