import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { MenubarModule } from 'primeng/menubar';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    MenubarModule,
    ToastModule,
    ConfirmDialogModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'Employee Tracker';
  menuItems: MenuItem[] = [];

  ngOnInit() {
    this.menuItems = [
      {
        label: 'Dashboard',
        icon: 'pi pi-fw pi-home',
        routerLink: '/company-summary',
      },
      {
        label: 'Employees',
        icon: 'pi pi-fw pi-users',
        routerLink: '/employees',
      },
      {
        label: 'Contracts',
        icon: 'pi pi-fw pi-briefcase',
        routerLink: '/contracts',
      },
      {
        label: 'Tools',
        icon: 'pi pi-fw pi-calculator',
        items: [
          {
            label: 'Rate Calculator',
            icon: 'pi pi-fw pi-calculator',
            routerLink: '/rate-calculator',
          },
        ],
      },
      {
        label: 'Settings',
        icon: 'pi pi-fw pi-cog',
        routerLink: '/settings',
      },
    ];
  }
}
