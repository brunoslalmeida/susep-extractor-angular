export interface ICompany {
    code: string;
    name: string;
}

export interface IType {
    code: string;
    value: string;
}

export interface IResult {
    month: string;
    values: IValues[];
}

export interface IValues {
    name: string;
    value: string;
}
