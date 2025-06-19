import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../services/api.service';
import { Contract } from '../../models/contract.model';
import { MessageService, ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-contract-list',
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    TagModule,
    TooltipModule,
  ],
  templateUrl: './contract-list.component.html',
  styleUrl: './contract-list.component.scss',
})
export class ContractListComponent implements OnInit {
  contracts: Contract[] = [];
  selectedContract: Contract = {} as Contract;
  displayDialog = false;
  dialogHeader = '';
  loading = true;
  isNew = false;

  contractTypes = [
    { label: 'Firm Fixed Price', value: 'FFP' },
    { label: 'Time & Materials', value: 'T&M' },
    { label: 'Cost Plus Fixed Fee', value: 'CPFF' },
  ];

  constructor(
    private apiService: ApiService,
    private router: Router,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit() {
    this.loadContracts();
  }

  loadContracts() {
    this.loading = true;
    this.apiService.getContracts().subscribe({
      next: (data) => {
        this.contracts = data;
        this.loading = false;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load contracts',
        });
        this.loading = false;
      },
    });
  }

  showAddDialog() {
    this.selectedContract = {
      contractNumber: '',
      contractName: '',
      customer: '',
      contractType: 'FFP',
      startDate: new Date(),
      endDate: new Date(),
      totalValue: 0,
    } as Contract;
    this.isNew = true;
    this.dialogHeader = 'Add Contract';
    this.displayDialog = true;
  }

  editContract(contract: Contract) {
    this.selectedContract = { ...contract };
    this.selectedContract.startDate = new Date(contract.startDate);
    this.selectedContract.endDate = new Date(contract.endDate);
    this.isNew = false;
    this.dialogHeader = 'Edit Contract';
    this.displayDialog = true;
  }

  saveContract() {
    if (this.isNew) {
      this.apiService.createContract(this.selectedContract).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Contract created',
          });
          this.displayDialog = false;
          this.loadContracts();
        },
        error: () => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to create contract',
          });
        },
      });
    } else {
      this.apiService
        .updateContract(this.selectedContract.id!, this.selectedContract)
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Contract updated',
            });
            this.displayDialog = false;
            this.loadContracts();
          },
          error: () => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update contract',
            });
          },
        });
    }
  }

  viewContract(id: number) {
    this.router.navigate(['/contracts', id]);
  }

  confirmDelete(contract: Contract) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete contract ${contract.contractNumber}?`,
      header: 'Confirm Delete',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.deleteContract(contract.id!);
      },
    });
  }

  deleteContract(id: number) {
    this.apiService.deleteContract(id).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Success',
          detail: 'Contract deleted',
        });
        this.loadContracts();
      },
      error: () => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to delete contract',
        });
      },
    });
  }

  getContractTypeSeverity(type: string): string {
    switch (type) {
      case 'FFP':
        return 'success';
      case 'T&M':
        return 'info';
      case 'CPFF':
        return 'warning';
      default:
        return 'secondary';
    }
  }
}
