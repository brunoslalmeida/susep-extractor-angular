import { IElement, IType, IValues } from "../models/common.models";
import { BaseAPI } from "./base";

type SUSEP_GET_RESPONSE = {
    companies: IElement[];
    types: IType[];
}
type SUSEP_BODY = { company: string, month: string, type: string };
type SUSEP_POSTRESPONSE = IValues[]

export class GenericSusepAPI extends BaseAPI {
    constructor(route: string) {
        super();
        this.route = route;
    }

    get() {
        return super._get<SUSEP_GET_RESPONSE>();
    }

    post(body: SUSEP_BODY) {
        return super._post<SUSEP_POSTRESPONSE, SUSEP_BODY>(body);
    }
}