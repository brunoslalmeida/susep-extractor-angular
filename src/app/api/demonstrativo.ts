import { IElement, IType } from "../models/common.models";
import { BaseAPI } from "./base";

type DEMONSTRATIVO_GET_RESPONSE =  {
    entities: IElement[];
    types: IType[];
    years: number[]
}

export class DemonstrativoAPI extends BaseAPI {
    constructor() {
        super();
        this.route = "demonstrativo";
    }

    get() {
        return super._get<DEMONSTRATIVO_GET_RESPONSE>();
    }
}