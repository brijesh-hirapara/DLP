import React, { useState, useEffect, useContext } from 'react';
import {
  languagesApi,
  stateEntitiesApi,
  municipalitiesApi,
  cantonsApi,
  userGroupsApi,
  organizationsApi,
} from '../../api/clients';
import { CommonDataContext } from './CommonDataContext';
import { hasPermission } from 'utility/accessibility/hasPermission';

export const CommonDataProvider = ({ children }) => {
  const [commonData, setCommonData] = useState({
    cantons: [],
    userGroups: [],
    languages: [],
    stateEntities: [],
    municipalities: [],
    isLoading: false
  });

  const fetchCommonData = async () => {
    setCommonData((prev) => ({ ...prev, isLoading: true }))
    try {
      const [
        languagesResponse,
        // stateEntitiesResponse,
        // municipalitiesResponse,
        // cantonsResponse,
        userGroupsResponse,
      ] = await Promise.all([
        languagesApi.apiLanguagesForUiGet(),
        // stateEntitiesApi.apiStateEntitiesGet({ pageSize: -1 }),
        // municipalitiesApi.apiMunicipalitiesGet({ pageSize: -1 }),
        // cantonsApi.apiCantonsGet({ pageSize: -1 }),
        hasPermission("user-groups:list") ? userGroupsApi.userGroupsGet() : new Promise((resolve) => resolve({ data: [] })),
      ]);

      setCommonData({
        languages: languagesResponse?.data,
        stateEntities:[],
        municipalities: [],
        cantons: [],
        userGroups: userGroupsResponse?.data,
      });

    } catch (error) {
      console.error(error);
    } finally {
      setCommonData((prev) => ({ ...prev, isLoading: false }))
    }
  };

  useEffect(() => {
    fetchCommonData();
  }, []);

  const contextValue = {
    ...commonData,
    refreshCommonData: fetchCommonData,
  };

  return (
    <CommonDataContext.Provider value={contextValue}>
      {children}
    </CommonDataContext.Provider>
  );
};
