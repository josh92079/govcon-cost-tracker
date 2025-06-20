// frontend/src/app/components/company-settings/company-settings.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { CompanyRates } from '../../models/company.model';
import { MessageService } from 'primeng/api';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { DividerModule } from 'primeng/divider';
import { MessageModule } from 'primeng/message';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-company-settings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputNumberModule,
    DividerModule,
    MessageModule,
    TooltipModule,
  ],
  templateUrl: './company-settings.component.html',
  styleUrl: './company-settings.component.scss',
})
export class CompanySettingsComponent implements OnInit {
  rates: CompanyRates = {
    fiscalYear: new Date().getFullYear(),
    overheadRate: 0,
    gaRate: 0,
    targetProfitMargin: 0,
    compensationCap: 0,
  };

  originalRates: CompanyRates | null = null;
  loading = false;
  saving = false;

  constructor(
    private apiService: ApiService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.loadRates();
  }

  loadRates() {
    this.loading = true;
    this.apiService.getCompanyRates().subscribe({
      next: (data) => {
        this.rates = { ...data };
        this.originalRates = { ...data };
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading rates:', error);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load company rates',
        });
      },
    });
  }

  saveRates() {
    this.saving = true;

    // Convert percentages to decimals for backend
    const payload = {
      ...this.rates,
      overheadRate: this.rates.overheadRate / 100,
      gaRate: this.rates.gaRate / 100,
      targetProfitMargin: this.rates.targetProfitMargin / 100,
    };

    this.apiService.updateCompanyRates(payload).subscribe({
      next: () => {
        this.saving = false;
        this.originalRates = { ...this.rates };
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Company rates updated successfully',
        });
      },
      error: (error) => {
        console.error('Error saving rates:', error);
        this.saving = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to save company rates',
        });
      },
    });
  }

  cancelChanges() {
    if (this.originalRates) {
      this.rates = { ...this.originalRates };
    }
  }

  hasChanges(): boolean {
    if (!this.originalRates) return false;

    return (
      this.rates.overheadRate !== this.originalRates.overheadRate ||
      this.rates.gaRate !== this.originalRates.gaRate ||
      this.rates.targetProfitMargin !== this.originalRates.targetProfitMargin ||
      this.rates.compensationCap !== this.originalRates.compensationCap
    );
  }

  calculateExampleWrapRate(): number {
    const fringe = 0.35; // Example 35% fringe
    const withFringe = 1 + fringe;
    const withOverhead = withFringe * (1 + this.rates.overheadRate / 100);
    const fullyBurdened = withOverhead * (1 + this.rates.gaRate / 100);
    return fullyBurdened;
  }

  getWrapRateSeverity(wrapRate: number): string {
    if (wrapRate < 1.5) return 'warning';
    if (wrapRate > 3.5) return 'danger';
    return 'success';
  }
}
