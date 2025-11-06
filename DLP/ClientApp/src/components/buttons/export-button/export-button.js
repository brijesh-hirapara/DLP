import React from 'react';
import { NavLink } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { Popover } from '../../popup/popup';
import { Button } from '../buttons';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';

const ExportButtonPageHeader = ({ data, columns, title = "export_data" }) => {
  const { t } = useTranslation();

  const exportToExcel = () => {
    const filteredData = data.map(item => {
      const filteredItem = {};
      columns.forEach(column => {
        filteredItem[column] = item[column];
      });
      return filteredItem;
    });

    // Create a worksheet
    const ws = XLSX.utils.json_to_sheet(filteredData);

    // Create a workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Save the workbook to a file
    XLSX.writeFile(wb, `${title}.xlsx`);
  };

  const exportToCSV = () => {
    const filteredData = data.map(item => {
      const filteredItem = {};
      columns.forEach(column => {
        filteredItem[column] = item[column];
      });
      return filteredItem;
    });


    // Convert the filtered data to CSV format
    const csvContent = `${columns.join(',')}\n${filteredData.map(item => columns.map(column => item[column]).join(',')).join('\n')}`;

    // Create a Blob containing the CSV data
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });

    // Create a link element and trigger a click to download the CSV file
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `${title}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      console.error('Export to CSV is not supported in this browser.');
    }
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.setFont("'Arial', sans-serif'", 'normal', 400);

    const filteredData = data.map(item => {
      const filteredItem = {};
      columns.forEach(column => {
        let cellValue = item[column];

        if (React.isValidElement(cellValue)) {
          cellValue = extractContentFromReactElement(cellValue);
        }

        filteredItem[column] = cellValue;
      });
      // debugger
      return filteredItem;
    });

    const rows = filteredData.map(item => Object.values(item));

    doc.autoTable({
      head: [columns?.map(column => t(column))],
      body: rows,
    });

    doc.save(`${title}.pdf`);
  };

  const handleExport = (exportType) => {
    switch (exportType) {
      case 'excel':
        exportToExcel();
        break;
      case 'csv':
        exportToCSV();
        break;
      case 'pdf':
        exportToPDF();
        break;
      default:
        break;
    }
  };

  const extractContentFromReactElement = (element) => {
    if (element.props.children) {
      if (typeof element.props.children === 'string') {
        return element.props.children;
      } else if (Array.isArray(element.props.children)) {
        return element.props.children.map(child => extractContentFromReactElement(child)).join(' ');
      }
    }
    return '';
  };

  const content = (
    <>
      <NavLink to="#" onClick={() => handleExport('excel')}>
        <FeatherIcon size={16} icon="x" />
        <span>Excel (XLSX)</span>
      </NavLink>
      <NavLink to="#" onClick={() => handleExport('csv')}>
        <FeatherIcon size={16} icon="file" />
        <span>CSV</span>
      </NavLink>
      <NavLink to="#" onClick={() => handleExport('pdf')}>
        <FeatherIcon size={16} icon="book-open" />
        <span>PDF</span>
      </NavLink>
    </>
  );

  return (
    <Popover placement="bottomLeft" content={data ? content : null} trigger="click">
      <Button size="small" type="white">
        <FeatherIcon icon="download" size={14} />
        {t('global:button.export', 'Export')}
      </Button>
    </Popover>
  );
};

export { ExportButtonPageHeader };
