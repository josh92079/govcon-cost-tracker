import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { ChartModule } from 'primeng/chart';
import { CompanySummary } from '../../models/company.model';
import { ApiService } from '../../services/api.service';

@Component({
  selector: 'app-company-summary',
  imports: [CommonModule, CardModule, TableModule, TagModule, ChartModule],
  templateUrl: './company-summary.component.html',
  styleUrl: './company-summary.component.scss',
})
export class CompanySummaryComponent implements OnInit {
  summary: CompanySummary | null = null;
  chartData: any;
  chartOptions: any;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadCompanySummary();
    this.setupChart();
  }

  loadCompanySummary() {
    this.apiService.getCompanySummary().subscribe({
      next: (data) => {
        this.summary = data;
        this.updateChart();
      },
      error: (error) => console.error('Error loading summary:', error),
    });
  }

  setupChart() {
    this.chartOptions = {
      plugins: {
        legend: {
          display: true,
        },
      },
      scales: {
        x: {
          ticks: {
            color: '#495057',
          },
          grid: {
            color: '#ebedef',
          },
        },
        y: {
          ticks: {
            color: '#495057',
          },
          grid: {
            color: '#ebedef',
          },
        },
      },
    };
  }

  updateChart() {
    if (this.summary) {
      const labels = this.summary.employees.map((e) => e.name);
      const revenue = this.summary.employees.map((e) => e.revenue);
      const cost = this.summary.employees.map((e) => e.cost);
      const profit = this.summary.employees.map((e) => e.profit);

      this.chartData = {
        labels: labels,
        datasets: [
          {
            label: 'Revenue',
            backgroundColor: '#42A5F5',
            data: revenue,
          },
          {
            label: 'Cost',
            backgroundColor: '#FFA726',
            data: cost,
          },
          {
            label: 'Profit',
            backgroundColor: '#66BB6A',
            data: profit,
          },
        ],
      };
    }
  }

  getMarginSeverity(margin: number): string {
    if (margin >= 15) return 'success';
    if (margin >= 10) return 'info';
    if (margin >= 5) return 'warning';
    return 'danger';
  }
}
