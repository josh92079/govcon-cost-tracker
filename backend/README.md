# Government Contractor Cost Tracking Backend

A TypeScript-based Express.js API for tracking employee costs, bill rates, and profitability for government contractors.

## Features

- **Employee Management**: Track base salary, fringe benefits, and calculate fully burdened costs
- **Contract Management**: Manage different contract types (FFP, T&M, CPFF) and employee assignments
- **Rate Calculations**: FAR-compliant rate calculations with transparent cost buildup
- **Company Settings**: Configure overhead, G&A, and target profit margins
- **TypeScript**: Full type safety and improved developer experience

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

3. Initialize database:

   ```bash
   npm run db:init
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

## Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run db:init` - Initialize database with sample data
- `npm run lint` - Run ESLint
- `npm test` - Run tests

## API Endpoints

### Employees

- `GET /api/employees` - List all employees
- `GET /api/employees/:id` - Get employee details
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Soft delete employee
- `GET /api/employees/:id/costs` - Get employee cost analysis

### Contracts

- `GET /api/contracts` - List all contracts
- `GET /api/contracts/:id` - Get contract with profitability
- `POST /api/contracts` - Create contract
- `PUT /api/contracts/:id` - Update contract
- `DELETE /api/contracts/:id` - Soft delete contract
- `POST /api/contracts/:id/assign-employee` - Assign employee to contract

### Company

- `GET /api/company/rates` - Get current rates
- `PUT /api/company/rates` - Update rates
- `GET /api/company/summary` - Get company-wide summary

### Rate Calculations

- `POST /api/rates/calculate` - Calculate rates for given parameters
- `GET /api/rates/employee/:id` - Get employee rate breakdown
- `GET /api/rates/contract/:id` - Get contract rate analysis

## Database Schema

The application uses Sequelize ORM with the following models:

- Employee
- FringeBenefits
- Contract
- EmployeeContract
- CompanyRates

## Production Deployment

For production deployment:

1. Set appropriate environment variables
2. Use a production database (PostgreSQL recommended)
3. Build the TypeScript code: `npm run build`
4. Start with: `npm start`
5. Use a process manager like PM2
6. Set up proper logging and monitoring
