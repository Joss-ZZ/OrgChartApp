import { IOrganizationalUnit } from './IOrganizationalUnit';
import { IEmployee } from './IEmployee';

export interface ITree {
    id: number,
    OrganizationalUnit: IOrganizationalUnit[],
    Employee: IEmployee[]
}