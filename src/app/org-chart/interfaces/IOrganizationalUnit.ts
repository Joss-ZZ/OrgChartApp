export interface IOrganizationalUnit {
    id?                  : number,
    brand?               : string,
    prefix?              : string,
    name?                : string,
    detail?              : string,
    type?                : string,
    parentId?            : number,
    leaderId?            : number,
    collaboratorIdList?  : string[]
}