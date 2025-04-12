import Papa from 'papaparse';
import { Voter } from '../services/api';

export const exportToCSV = (data: Voter[], filename: string): void => {
    // Remove password field from export
    const exportData = data.map(({ password, ...rest }) => rest);
    
    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', filename);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
};
