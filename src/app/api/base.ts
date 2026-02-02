import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IResult } from '../models/common.models';
import * as XLSX from 'xlsx';

export class BaseAPI {
    private baseUrl = "https://susep-extractor.bruno-s-l-almeida.workers.dev/";

    protected http = inject(HttpClient);
    protected route: string | undefined;

    _get<T>() {
        if (this.route === undefined) throw new Error('Method not implemented.');
        return this.http.get<T>(this.baseUrl + this.route);
    }

    _post<t, b>(body: b) {
        if (this.route === undefined) throw new Error('Method not implemented.');
        return this.http.post<t>(this.baseUrl + this.route, body)
    }

    public transformData(results: IResult[]): { [key: string]: string; }[] {
        const data: { [key: string]: string }[] = [];

        if (!results || results.length === 0) {
            return data;
        }

        for (const result of results) {
            for (const [index, value] of result.values.entries()) {
                if (value.value === null || value.value === undefined) continue;

                const row: { [key: string]: string } = data[index] || {};
                row[result.key + ' - Value'] = value.value;
                row[result.key + ' - Category'] = value.name;

                data[index] = row;
            }
        }

        return data;
    }

    public exportToExcel(
        fileName: string,
        table: { [key: string]: string }[],
        metadataTab?: { [key: string]: any }
    ) {
        if (!table || table.length === 0) return;

        const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(table);
        const wb: XLSX.WorkBook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Report');

        if (metadataTab) {
            const ws2: XLSX.WorkSheet = XLSX.utils.json_to_sheet([metadataTab]);
            XLSX.utils.book_append_sheet(wb, ws2, 'Metadata');
        }

        const timestamp = new Date().toISOString().replace(/[-:.]/g, '');
        XLSX.writeFile(wb, `report_${fileName}_${timestamp}.xlsx`);
    }
}