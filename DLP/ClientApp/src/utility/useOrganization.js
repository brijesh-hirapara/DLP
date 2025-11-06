import { OrganizationsApi } from "api/api";
import { useDecodeJWT } from "hooks/useDecodeJWT";
import { useEffect, useState } from "react";
const organizationApi = new OrganizationsApi();

export const useOrganization = () => {
  const [organization, setOrganization] = useState();
  const token = useDecodeJWT();
  const organizationId = token?.organizationId;
  const fetchData = async () => {
    const {data} = await organizationApi.apiOrganizationsIdGet({
      id: organizationId
    });
    setOrganization(data);
  };
  useEffect(() => {
 
  
    if (organizationId)
      fetchData();
  }, [organizationId]);
    return {institution:organization,fetchData};
};