import { OrganizationsApi } from "api/api";
import { OrganizationDto } from "api/models";
import { useDecodeJWT } from "hooks/useDecodeJWT";
import { useEffect, useState } from "react";

const organizationApi = new OrganizationsApi();

export const useOrganization = (): OrganizationDto => {
  const [organization, setOrganization] = useState<OrganizationDto>({});
  const token = useDecodeJWT();
  const organizationId = token?.organizationId;

  useEffect(() => {
    const fetchOrganization = async () => {
      try {
        const response = await organizationApi.apiOrganizationsIdGet({
          id: organizationId,
        });
        setOrganization(response.data);
      } catch (err) {}
    };

    if (organizationId) {
      fetchOrganization();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organizationId]);

  return organization;
};
