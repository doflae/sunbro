import {createStore, applyMiddleware} from "redux";
import {ContextReducer} from "./ContextReducer"
import {asyncActions} from "./AsyncMiddleware"
import {CommonReducer} from "./CommonReducer"
export const HumorDataStore = createStore(CommonReducer(ContextReducer), applyMiddleware(asyncActions));