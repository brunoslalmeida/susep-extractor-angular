import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export class BaseAPI {
    private baseUrl = "https://susep-extractor.bruno-s-l-almeida.workers.dev/";
    
    protected http = inject(HttpClient);
    protected route: string | undefined;

    _get<T>() {
        if (this.route === undefined) throw new Error('Method not implemented.');
        return this.http.get<T>(this.baseUrl + this.route);
    }

    _post<t, b>(body: b){
        if (this.route === undefined) throw new Error('Method not implemented.');
        return this.http.post<t>(this.baseUrl + this.route, body)
    }
}