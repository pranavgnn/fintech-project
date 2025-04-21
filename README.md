# 💰 FinBank - Modern Banking Application

FinBank is a comprehensive banking platform built with Spring Boot and React, enabling users to manage their finances, transfer funds, and track their transaction history with an intuitive interface.

![FinBank Dashboard](https://github.com/pranavgnn/fintech-project/raw/main/screenshots/dashboard.png)

### Team

1. Pranav G Nayak - 230958011
2. Aprameya Srinivasan Tatachari - 230958006
3. Sampat Rohan Jaideep - 230958005
4. Suhani Patel - 230958018

## 📋 Features

### User Features

- **Account Management**: Create and manage multiple bank accounts (Savings, Checking, Fixed Deposit)
- **Money Transfers**: Transfer funds between your accounts or to other users
- **Transaction History**: View detailed transaction history with comprehensive filtering
- **Analytics Dashboard**: Visualize spending patterns and account balances over time
- **Special Offers**: Receive personalized banking offers and promotions

### Admin Features

- **User Management**: Admin panel to manage user accounts
- **Transaction Monitoring**: View and filter all system transactions
- **Offer Management**: Create and manage special offers for users
- **Analytics**: View system-wide statistics and user activity

### Technical Features

- **JWT Authentication**: Secure API with token-based authentication
- **Role-Based Access Control**: Different capabilities for users and administrators
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: React-based UI with real-time data updates

## 🚀 Technology Stack

### Backend

- **Java 21**
- **Spring Boot 3.2**
- **Spring Security** with JWT Authentication
- **Spring Data JPA** with Hibernate
- **PostgreSQL** Database
- **Maven** for build automation

### Frontend

- **React 18** with TypeScript
- **Vite** for frontend tooling
- **TailwindCSS** and **shadcn/ui** for styling
- **React Router** for navigation
- **React Hook Form** for form handling
- **Recharts** for data visualization
- **Framer Motion** for animations

## 🛠️ Setup & Installation

### Prerequisites

- Java JDK 21
- Node.js 18+ and pnpm
- PostgreSQL

### Clone the Repository

```bash
git clone https://github.com/pranavgnn/fintech-project.git
cd fintech-project
```

### Backend Setup

1. Configure the database in `src/main/resources/application.properties`:

```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/finbank
spring.datasource.username=postgres
spring.datasource.password=yourpassword
```

2. Run the Spring Boot application:

```bash
# For Windows
java "C:\Program Files\Java\jdk-21\bin\java.exe" @C:\Users\hp\AppData\Local\Temp\cp_9hzj3phdqplk14ba5c3ifdsru.argfile com.fintech.FintechApplication

# Alternative method
./mvnw spring-boot:run
```

The backend will start on http://localhost:8080

### Frontend Setup

1. Navigate to the UI directory:

```bash
cd ui
```

2. Install dependencies:

```bash
pnpm install
```

3. Run the development server:

```bash
pnpm dev
```

4. For production preview:

```bash
pnpm build
pnpm preview
```

The frontend will be available at http://localhost:4173 (or the port shown in your terminal)

## 📱 Usage

### Default Admin Account

- **Email**: admin@example.com
- **Password**: admin123

### User Registration

1. Navigate to the signup page
2. Fill in required details including KYC information
3. After signup, you'll be redirected to the dashboard

### Creating Accounts

1. From the dashboard, navigate to "Create Account"
2. Choose account type and initial deposit amount
3. Confirm the creation

### Making Transfers

1. Navigate to the "Transfer" section
2. Select source account and enter destination details
3. Enter amount and confirm the transfer
