export interface IElement {
    code: string;
    name: string;
}

export type ICompany = IElement;
export type IEntity = IElement;

export interface IType {
    code: string;
    value: string;
}

export interface IResult {
    key: string;
    values: IValues[];
}

export interface IValues {
    name: string;
    value: string;
}


