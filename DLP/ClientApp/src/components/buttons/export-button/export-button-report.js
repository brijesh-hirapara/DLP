import React from 'react';
import { NavLink } from 'react-router-dom';
import FeatherIcon from 'feather-icons-react';
import { Popover } from '../../popup/popup';
import { Button } from '../buttons';
import { useTranslation } from 'react-i18next';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

const ExportButtonReportPageHeader = ({ data, columns, title = "export_data" }) => {
  const { t } = useTranslation();

  const exportToExcel = () => {
      const table = document.getElementById('table-to-xls');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table, { raw: true });

    // Add styling for borders and colors
    const borderStyle = { border: "1px solid #000000" };
    const colorStyle = { color: "#ffffff", background: "#000000" };

    // Apply borders and colors to header row
    ws["!cols"] = Array.from({ length: columns.length }, () => ({ width: 20 }));
    ws["!rows"] = [{ hpx: 20 }]; // Adjust height of the header row as needed
    ws["A1"].s = borderStyle;
    ws["B1"].s = borderStyle;
    // Add more styles to each cell if needed

    // Set headers to bold and apply color
    ws["A1"].s = colorStyle;
    ws["B1"].s = colorStyle;
    // Add more styles to each cell if needed

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "service technician report");

    // Save workbook
    XLSX.writeFile(wb, 'service-technician-report.xlsx');

  };

  const exportToCSV = () => {
    const table = document.getElementById('table-to-xls');
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.table_to_sheet(table, { raw: true });

    // Add styling for borders and colors
    const borderStyle = { border: "1px solid #000000" };
    const colorStyle = { color: "#ffffff", background: "#000000" };

    // Apply borders and colors to header row
    ws["!cols"] = Array.from({ length: columns.length }, () => ({ width: 20 }));
    ws["!rows"] = [{ hpx: 20 }]; // Adjust height of the header row as needed
    ws["A1"].s = borderStyle;
    ws["B1"].s = borderStyle;
    // Add more styles to each cell if needed

    // Set headers to bold and apply color
    ws["A1"].s = colorStyle;
    ws["B1"].s = colorStyle;
    // Add more styles to each cell if needed

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, "service technician report");

    // Save workbook
    XLSX.writeFile(wb, 'service-technician-report.csv');
  };

  const exportToPDF = () => {
    const element = document.getElementById('table-to-xls'); // Replace 'table-to-xls' with the ID of your HTML element
    if (element) {
      const h3Element = document.createElement('h3');
      h3Element.innerText = 'MVTEO Annual Report On Collected Substances';
      const firstChild = element.firstChild;
      element.insertBefore(h3Element, firstChild);
      const title = 'MVTEO Annual Report On Collected Substances';
      html2canvas(element, {
        scale: 2 // Adjust the scale factor as needed
      }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');

        // Add title at the top
        pdf.setFontSize(16);
        pdf.text(title, 105, 10, { align: 'center' });
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 50); // A4 size: 210mm x 297mm
        pdf.setProperties({
          title: 'MVTEO Annual Report On Collected Substances' // Set the title of the PDF document
        });
        pdf.save('converted-document.pdf');
      });
      h3Element.remove();
    }
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

export { ExportButtonReportPageHeader };
