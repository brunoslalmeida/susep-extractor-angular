import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormControl, FormGroup } from '@angular/forms';
import { initFlowbite } from 'flowbite';

import { Observable } from 'rxjs';

interface ICompany {
  code: string;
  name: string;
}

interface IType {
  code: string;
  value: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  private baseUrl = 'https://susep-extractor.bruno-s-l-almeida.workers.dev/';

  companies: ICompany[] = [];
  types: IType[] = [];

  susepForm = new FormGroup({
    company: new FormControl(''),
    type: new FormControl(''),
  });

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    initFlowbite();
    this.http
      .get<{
        companies: ICompany[];
        types: IType[];
      }>(this.baseUrl)
      .subscribe(data => {
        this.companies = data.companies;
        this.types = data.types
      });
  }

  onSubmit() {
    console.log(this.susepForm.value);
  }

  title = 'Susep Extractor';
}
