import Axios from "axios";
import {RestUrls} from "./Urls";

export class RestDataSource{

    constructor(err_handler){
        this.err_handler = err_handler || (()=>{});
    }

    GetData = async(dataType, params) =>
    this.SendRequest("get", RestUrls[dataType], params);

    ContextData = (dataType, data) =>
    this.SendRequest("post", RestUrls[dataType], {}, data);

    SendRequest = (method, url, params, data) => Axios.request({method,url,params, data});

}