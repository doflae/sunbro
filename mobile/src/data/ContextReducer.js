import {ActionTypes} from "./Types";

export const ContextReducer = (storeData, action) => {
    switch(action.type){
        case ActionTypes.DATA_LOAD:
            return{
                ...storeData,
                [action.payload.dataType]: action.payload.data
            };
        default:
            return storeData || {};
    }
}