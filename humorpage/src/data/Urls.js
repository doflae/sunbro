import {DataTypes} from "./Types"

// const protocol = "http";
// const hostname = "localhost";
// const port = 3500;

export const RestUrls = {
    [DataTypes.CONTEXTS]: `/api/contexts`,
    [DataTypes.COMMENTS]: `/api/comments`
}

export const authUrl = `/account/signin`