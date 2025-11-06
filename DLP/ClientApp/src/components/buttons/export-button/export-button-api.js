import React, { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import FeatherIcon from "feather-icons-react";
import { Popover } from "../../popup/popup";
import { Button } from "../buttons";
import { useTranslation } from "react-i18next";
import "jspdf-autotable";
import { ExportDataApi } from "api/clients/export-data-api";

const exportDataApi = new ExportDataApi();

const ExportButtonPageApiHeader = ({
  callFrom,
  filterType,
  listArchived = false,
  municipalityId,
  entityId,
  search,
  typeOfEquipmentId,
  from,
  to,
}) => {
  const { t } = useTranslation();
  const [isLoadingExcel, setIsLoadingExcel] = useState(false);
  const [isLoadingCsv, setIsLoadingCsv] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState(false);
  const [timeZone, setTimeZone] = useState("");

  useEffect(() => {
    const getTimeZone = () => {
      const userTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setTimeZone(userTimeZone);
    };

    getTimeZone();

    // Cleanup function to prevent memory leaks
    return () => {
      // Clean up any subscriptions or asynchronous tasks here
    };
  }, []);
  const exportToExcel = async () => {
    setIsLoadingExcel(true);
    const request = {
      exportType: 1,
      callFrom,
      filterType,
      listArchived,
      timeZone: timeZone,
      municipalityId,
      entityId,
      search,
      typeOfEquipmentId,
      from,
      to,
    };
    try {
      const response = await exportDataApi.apiExportDataGet({ ...request });
      downloadFile(response.data);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setIsLoadingExcel(false);
    }
  };

  const exportToCSV = async () => {
    setIsLoadingCsv(true);
    const request = {
      exportType: 2,
      callFrom,
      filterType,
      listArchived,
      timeZone: timeZone,
      municipalityId,
      entityId,
      search,
      typeOfEquipmentId,
      from,
      to,
    };
    try {
      const { data } = await exportDataApi.apiExportDataGet({ ...request });
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${callFrom}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setIsLoadingCsv(false);
    }
  };

  const exportToPDF = async () => {
    setIsLoadingPdf(true);
    const request = {
      exportType: 3,
      callFrom,
      filterType,
      listArchived,
      timeZone: timeZone,
      municipalityId,
      entityId,
      search,
      typeOfEquipmentId,
      from,
      to,
    };
    try {
      const { data } = await exportDataApi.apiExportDataGet({ ...request });
      downloadFile(data);
    } catch (error) {
      console.error("Error exporting data:", error);
    } finally {
      setIsLoadingPdf(false);
    }
  };

  const handleExport = (exportType) => {
    switch (exportType) {
      case 1:
        exportToExcel();
        break;
      case 2:
        exportToCSV();
        break;
      case 3:
        exportToPDF();
        break;
      default:
        break;
    }
  };

  const extractContentFromReactElement = (element) => {
    if (element.props.children) {
      if (typeof element.props.children === "string") {
        return element.props.children;
      } else if (Array.isArray(element.props.children)) {
        return element.props.children
          .map((child) => extractContentFromReactElement(child))
          .join(" ");
      }
    }
    return "";
  };

  const downloadFile = (response) => {
    const { fileContents, fileDownloadName, contentType } = response;
    // Convert base64 file content to binary data
    const byteCharacters = atob(fileContents);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    // Create Blob
    const blob = new Blob([byteArray], { type: contentType });
    // Create a download link
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileDownloadName;
    // Append the link to the body
    document.body.appendChild(link);
    // Trigger a click on the link to start the download
    link.click();
    // Remove the link from the body
    document.body.removeChild(link);
  };

  const content = (
    <>
      <NavLink to="#" onClick={() => handleExport(1)}>
        <FeatherIcon size={16} icon="x" />
        <span>{isLoadingExcel ? " Exporting..." : "Excel (XLSX)"}</span>
      </NavLink>
      <NavLink to="#" onClick={() => handleExport(2)}>
        <FeatherIcon size={16} icon="file" />
        <span>{isLoadingCsv ? " Exporting..." : "CSV"}</span>
      </NavLink>
      <NavLink to="#" onClick={() => handleExport(3)}>
        <FeatherIcon size={16} icon="book-open" />
        <span>{isLoadingPdf ? " Exporting..." : "PDF"}</span>
      </NavLink>
    </>
  );

  return (
    <Popover
      placement="bottomLeft"
      content={callFrom ? content : null}
      trigger="click"
    >
      <Button size="small" type="white">
        <FeatherIcon icon="download" size={14} />
        {t("global:button.export", "Export")}
      </Button>
    </Popover>
  );
};

export { ExportButtonPageApiHeader };
