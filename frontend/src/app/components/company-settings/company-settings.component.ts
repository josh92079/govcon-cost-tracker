import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CompanyRates } from '../../models/company.model';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';

@Component({
  selector: 'app-company-settings',
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
  ],
  templateUrl: './company-settings.component.html',
  styleUrl: './company-settings.component.scss',
})
export class CompanySettingsComponent implements OnInit {
  rates: CompanyRates | null = null;
  overheadRatePercent = 0;
  gaRatePercent = 0;
  targetProfitPercent = 0;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadRates();
  }

  loadRates() {
    this.apiService.getCompanyRates().subscribe({
      next: (data) => {
        this.rates = data;
        this.overheadRatePercent = data.overheadRate * 100;
        this.gaRatePercent = data.gaRate * 100;
        this.targetProfitPercent = data.targetProfitMargin * 100;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load company rates',
        });
      },
    });
  }

  saveRates() {
    if (!this.rates) return;

    const updatedRates = {
      ...this.rates,
      overheadRate: this.overheadRatePercent / 100,
      gaRate: this.gaRatePercent / 100,
      targetProfitMargin: this.targetProfitPercent / 100,
    };

    this.apiService.updateCompanyRates(updatedRates).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Company rates updated successfully',
        });
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update company rates',
        });
      },
    });
  }

  calculateWrapRate(): number {
    const overhead = 1 + this.overheadRatePercent / 100;
    const ga = 1 + this.gaRatePercent / 100;
    return overhead * ga;
  }
}
