import axios from "axios";

axios.defaults.withCredentials=true;

export const request = (method, url, data, p) =>{
    return axios({
        method,
        url,
        data,
    })
    .then((res) => {
        if("user" in res.headers){
            p.setState({
                user:JSON.parse(res.headers['user'])
            })
        }
        res.data})
    .catch((err) => console.log(err))
}