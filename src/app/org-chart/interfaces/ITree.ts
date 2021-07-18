import { IOrganizationalUnit } from './IOrganizationalUnit';
import { IEmployee } from './IEmployee';

export interface ITree {
    id: string,
    OrganizationalUnit: IOrganizationalUnit[],
    Employee: IEmployee[]
}