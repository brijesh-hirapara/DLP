import { Col, Row} from "antd";
import {  RequestsApi } from "api/api";
import { Cards } from "components/cards/frame/cards-frame";
import { useEffect, useState } from "react";
import { PageHeader } from "components/page-headers/page-headers";
import {  Main } from "../../../../container/styled";
import { useTranslation } from "react-i18next";
import { useTableSorting } from "hooks/useTableSorting";
import { ExportButtonPageApiHeader } from "components/buttons/export-button/export-button-api";
import { ProjectHeader, ProjectSorting } from "../../../localization/email/style"
import MyTemplatesTable from "./MyTemplatesTable";
import { AutoComplete } from "components/autoComplete/autoComplete";

const requestsApi = new RequestsApi();

function ListMyTemplatesPage() {
  const { t } = useTranslation();
  // const { hasPermission } = useAuthorization();

  const [isLoading, setIsLoading] = useState(false);
  const { sorting, onSorterChange } = useTableSorting();
  const [query, setQuery] = useState({
    search: "",
    pageNumber: 1,
    pageSize: 10,
  });

const [templates, setTemplates] = useState([]);

useEffect(() => {
  getTemplateList();
}, [query, sorting]);

const getTemplateList = async () => {
  setIsLoading(true);
  const { data } = await requestsApi.apiTemplateListGet({ ...query, ...sorting });
  setTemplates(data);
  setIsLoading(false);
};

  const onSearchChange = (value) => {
    setQuery({ ...query, search: value });
  };

  const onPaginationChange = (pageNumber) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber }));
  };

  const onShowSizeChange = (pageNumber, pageSize) => {
    setQuery((prevQuery) => ({ ...prevQuery, pageNumber, pageSize }));
  };

  return (
    <>
      {/* <CardToolbox> */}
      <ProjectHeader>
        <PageHeader
          ghost
          title={t("my-templates.title", "My Templates")}
          subTitle={<>{templates?.totalCount} {t("my-templates:total-templates", "Total Templates")}</>}
          buttons={[
            <ExportButtonPageApiHeader
              key="1"
              callFrom={"TransportTemplates"}
              filterType={0}
              municipalityId={""}
              entityId={""}
              search={query.search}
              typeOfEquipmentId={""}
              from={""}
              to={""}
            />
          ]}
        />
      </ProjectHeader>
        {/* </CardToolbox> */}

      <Main>
          <Row gutter={25}>
            <Col xs={24}>
              <ProjectSorting>
                <div className="project-sort-bar">
                  <div className="project-sort-search">
                    <AutoComplete
                      onSearch={(value) => onSearchChange(value)}
                      placeholder={t(
                  "my-templates.search-placeholder",
                  "Search Templates"
                )}
                      patterns
                    />
                  </div>
                </div>
              </ProjectSorting>
            </Col>
          </Row>

          <Row gutter={25}>
           <Col xs={24}>
            <Cards headless bodyStyle={{ padding: 0 }}>            
              <MyTemplatesTable 
                data={templates}
                isLoading={isLoading}
                onPaginationChange={onPaginationChange}
                onShowSizeChange={onShowSizeChange}
                onSorterChange={onSorterChange}
                refetch={() =>getTemplateList()}
              />
            </Cards>
          </Col>
        </Row>
      </Main>
    </>
  );
}

export default ListMyTemplatesPage;
