import { IElement, IType, IValues } from "../models/common.models";
import { BaseAPI } from "./base";

type DEMONSTRATIVO_GET_RESPONSE = {
    entities: IElement[];
    types: IType[];
    years: number[]
}

type DEMONSTRATIVO_POST_BODY = {
    entity: string;
    type: string;
    year: number;
}

type DEMONSTRATIVO_POST_RESPONSE = {
    values: IValues[];
}

export class DemonstrativoAPI extends BaseAPI {
    constructor() {
        super();
        this.route = "demonstrativo";
    }

    get() {
        return super._get<DEMONSTRATIVO_GET_RESPONSE>();
    }

    post(body: DEMONSTRATIVO_POST_BODY) {
        return super._post<DEMONSTRATIVO_POST_RESPONSE, DEMONSTRATIVO_POST_BODY>(body);
    }
}