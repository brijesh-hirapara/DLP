import { CantonsApi } from './cantons-api';
import { OrganizationsApi } from './organizations-api';
import { LanguagesApi } from './languages-api';
import { MunicipalitiesApi } from './municipalities-api';
import { StateEntitiesApi } from './state-entities-api';
import { UserGroupsApi } from './user-groups-api';

export const languagesApi = new LanguagesApi();
export const stateEntitiesApi = new StateEntitiesApi();
export const municipalitiesApi = new MunicipalitiesApi();
export const cantonsApi = new CantonsApi();
export const userGroupsApi = new UserGroupsApi();
export const organizationsApi = new OrganizationsApi();

