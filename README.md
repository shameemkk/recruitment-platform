# Recruitment Platform

A NestJS-based recruitment management system with role-based access control (RBAC), supporting multi-tenant operations for managing clients, job vacancies, candidates, and recruitment workflows.

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/shameemkk/recruitment-platform/
cd recruitment-platform

# Install dependencies
npm install

# Create environment file
cp .env
# Edit .env with your configuration

# Start the application
npm run start:dev
```

### Scripts

| Command | Description |
|---------|-------------|
| `npm run start` | Start production server |
| `npm run start:dev` | Start development server with hot reload |
| `npm run build` | Build the application |

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `MONGODB_URI` | MongoDB connection string | `mongodb://127.0.0.1:27017/recruitment-platform` |
| `JWT_SECRET` | Secret key for access token signing | `your-secure-secret-key` |
| `JWT_EXPIRES_IN` | Access token expiration time | `15m` |
| `JWT_REFRESH_SECRET` | Secret key for refresh token signing | `your-refresh-secret-key` |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiration time | `7d` |
| `ADMIN_EMAIL` | Default super admin email | `admin@system.com` |
| `ADMIN_PASSWORD` | Default super admin password | `AdminSecure@2025!` |
| `NODE_ENV` | Environment mode (enables secure cookies in production) | `production` |

## Architecture Overview

```
src/
├── common/                 # Shared utilities
│   ├── decorators/         # Custom decorators (@Roles, @Permissions, @CurrentUser)
│   ├── guards/             # Auth guards (RolesGuard, PermissionsGuard, SuperAdminGuard)
│   └── pipes/              # Validation pipes (ParseObjectIdPipe)
├── config/                 # Configuration modules
│   ├── admin.config.ts     # Admin credentials config
│   ├── database.config.ts  # MongoDB config
│   └── jwt.config.ts       # JWT config
├── modules/
│   ├── auth/               # Authentication (JWT login, profile)
│   ├── user/               # User management (CRUD)
│   ├── role/               # Role management
│   ├── permission/         # Permission management
│   ├── client/             # Client/company management
│   ├── job-template/       # Reusable job templates
│   ├── job-vacancy/        # Active job postings
│   └── candidate/          # Candidate tracking
├── seed/                   # Database seeding (auto-creates admin)
├── app.module.ts           # Root module
└── main.ts                 # Application entry point
```

### Tech Stack

- **Framework**: NestJS 11
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Passport.js with JWT strategy
- **Validation**: class-validator & class-transformer
- **Password Hashing**: bcrypt

### Request Flow

```
Request → JWT Guard → Roles Guard → Permissions Guard → Controller → Service → Database
```

## Role & Permission System

### How It Works

The platform implements a flexible RBAC system with two layers:

1. **Roles** - Define user types (e.g., ADMIN, EMPLOYEE, AGENCY)
2. **Permissions** - Fine-grained access controls assigned to roles

### Data Models

**Role Schema**
```typescript
{
  name: string;           // Role identifier (e.g., "ADMIN", "EMPLOYEE")
  permissions: ObjectId[]; // Array of permission references
  isSuperAdmin: boolean;   // Bypasses all permission checks
}
```

**Permission Schema**
```typescript
{
  key: string;        // Permission identifier (e.g., "CREATE_CLIENT")
  description: string; // Human-readable description
}
```

**User Schema**
```typescript
{
  fullName: string;
  email: string;
  password: string;    // Hashed with bcrypt
  isActive: boolean;
  roleId: ObjectId;    // Reference to Role
}
```

### Built-in Roles

| Role | Description |
|------|-------------|
| `ADMIN` | Super admin with `isSuperAdmin: true`, bypasses all permission checks |

### Permission Keys

Permissions follow the pattern `ACTION_RESOURCE`:

| Permission | Description |
|------------|-------------|
| `CREATE_CLIENT` | Create new clients |
| `READ_CLIENT` | View client information |
| `UPDATE_CLIENT` | Modify client data |
| `DELETE_CLIENT` | Remove clients |

Similar patterns apply for other resources (job templates, vacancies, candidates).

### Using Guards & Decorators

```typescript
@Controller('clients')
@UseGuards(AuthGuard('jwt'), RolesGuard, PermissionsGuard)
export class ClientController {
  
  @Post()
  @Roles('ADMIN')                    // Requires ADMIN role
  @Permissions('CREATE_CLIENT')      // Requires CREATE_CLIENT permission
  create(@Body() dto: CreateClientDto) { ... }

  @Get()
  @Roles('ADMIN', 'EMPLOYEE')        // Multiple roles allowed
  @Permissions('READ_CLIENT')
  findAll(@CurrentUser() user) { ... }
}
```

### Guard Behavior

- **SuperAdminGuard**: Only allows users with `isSuperAdmin: true`
- **RolesGuard**: Checks if user's role matches required roles (super admin bypasses)
- **PermissionsGuard**: Checks if user's role has required permissions (super admin bypasses)

### Creating Custom Roles

1. Create permissions via the Permission API
2. Create a role with desired permissions via the Role API
3. Assign the role to users

## API Endpoints

### Authentication

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/auth/login` | Login with email/password, returns access token and sets refresh token cookie | Public |
| `POST` | `/auth/refresh` | Get new access token using refresh token cookie | Cookie |
| `POST` | `/auth/logout` | Clear refresh token cookie | Public |
| `GET` | `/auth/profile` | Get current user profile | JWT |

#### Refresh Token Flow

The authentication system uses a dual-token approach:

1. **Access Token** (short-lived, 15m default)
   - Returned in response body
   - Used in `Authorization: Bearer <token>` header
   - Short expiration for security

2. **Refresh Token** (long-lived, 7d default)
   - Stored as HTTP-only cookie (not accessible via JavaScript)
   - Automatically sent with requests to `/auth/refresh`
   - Used to obtain new access tokens without re-login

**Cookie Settings:**
- `httpOnly: true` - Prevents XSS attacks
- `secure: true` (in production) - HTTPS only
- `sameSite: strict` - Prevents CSRF attacks
- `maxAge: 7 days`

### Users (Super Admin Only)

| Method | Endpoint | Description | Guard |
|--------|----------|-------------|-------|
| `POST` | `/users` | Create a new user | SuperAdminGuard |
| `GET` | `/users` | List all users | SuperAdminGuard |
| `GET` | `/users/:id` | Get user by ID | SuperAdminGuard |
| `PATCH` | `/users/:id` | Update user | SuperAdminGuard |
| `DELETE` | `/users/:id` | Delete user | SuperAdminGuard |

### Permissions (Super Admin Only)

| Method | Endpoint | Description | Guard |
|--------|----------|-------------|-------|
| `POST` | `/permissions` | Create a new permission | SuperAdminGuard |
| `GET` | `/permissions` | List all permissions | SuperAdminGuard |
| `GET` | `/permissions/:id` | Get permission by ID | SuperAdminGuard |
| `PATCH` | `/permissions/:id` | Update permission | SuperAdminGuard |
| `DELETE` | `/permissions/:id` | Delete permission | SuperAdminGuard |

### Roles (Super Admin Only)

| Method | Endpoint | Description | Guard |
|--------|----------|-------------|-------|
| `POST` | `/roles` | Create a new role | SuperAdminGuard |
| `GET` | `/roles` | List all roles | SuperAdminGuard |
| `GET` | `/roles/:id` | Get role by ID | SuperAdminGuard |
| `PATCH` | `/roles/:id` | Update role | SuperAdminGuard |
| `DELETE` | `/roles/:id` | Delete role | SuperAdminGuard |
| `POST` | `/roles/:id/permissions/:permissionKey` | Add single permission to role | SuperAdminGuard |
| `DELETE` | `/roles/:id/permissions/:permissionKey` | Remove permission from role | SuperAdminGuard |
| `POST` | `/roles/:id/permissions` | Add multiple permissions (body: `{ permissions: string[] }`) | SuperAdminGuard |

### Clients

| Method | Endpoint | Description | Roles | Permission |
|--------|----------|-------------|-------|------------|
| `POST` | `/clients` | Create a new client | ADMIN | `CREATE_CLIENT` |
| `GET` | `/clients` | List all clients (Admin: all, Employee: assigned only) | ADMIN, EMPLOYEE | `READ_CLIENT` |
| `GET` | `/clients/:id` | Get client by ID | ADMIN, EMPLOYEE | `READ_CLIENT` |
| `PATCH` | `/clients/:id` | Update client | ADMIN | `UPDATE_CLIENT` |
| `DELETE` | `/clients/:id` | Delete client | ADMIN | `DELETE_CLIENT` |

### Job Templates

| Method | Endpoint | Description | Roles | Permission |
|--------|----------|-------------|-------|------------|
| `POST` | `/job-templates` | Create a new job template | ADMIN, EMPLOYEE | `CREATE_JOB_TEMPLATE` |
| `GET` | `/job-templates` | List all job templates | ADMIN, EMPLOYEE | `READ_JOB_TEMPLATE` |
| `GET` | `/job-templates/:id` | Get job template by ID | ADMIN, EMPLOYEE | `READ_JOB_TEMPLATE` |
| `PATCH` | `/job-templates/:id` | Update job template | ADMIN, EMPLOYEE | `UPDATE_JOB_TEMPLATE` |
| `DELETE` | `/job-templates/:id` | Delete job template | ADMIN | `DELETE_JOB_TEMPLATE` |

### Job Vacancies

| Method | Endpoint | Description | Roles | Permission |
|--------|----------|-------------|-------|------------|
| `POST` | `/job-vacancies` | Create a new job vacancy | EMPLOYEE | `CREATE_JOB_VACANCY` |
| `GET` | `/job-vacancies` | List vacancies (Agency: assigned only, supports `?clientId=`) | ADMIN, EMPLOYEE, AGENCY | `READ_JOB_VACANCY` |
| `GET` | `/job-vacancies/:id` | Get job vacancy by ID | ADMIN, EMPLOYEE, AGENCY | `READ_JOB_VACANCY` |
| `PATCH` | `/job-vacancies/:id` | Update job vacancy | EMPLOYEE | `UPDATE_JOB_VACANCY` |
| `DELETE` | `/job-vacancies/:id` | Delete job vacancy | EMPLOYEE | `DELETE_JOB_VACANCY` |
| `POST` | `/job-vacancies/:id/agencies/:agencyId` | Assign agency to vacancy | EMPLOYEE | `UPDATE_JOB_VACANCY` |
| `DELETE` | `/job-vacancies/:id/agencies/:agencyId` | Remove agency from vacancy | EMPLOYEE | `UPDATE_JOB_VACANCY` |

### Candidates

| Method | Endpoint | Description | Roles | Permission |
|--------|----------|-------------|-------|------------|
| `POST` | `/candidates` | Create a new candidate | ADMIN, AGENCY | `CREATE_CANDIDATE` |
| `GET` | `/candidates` | List candidates (Agency: own only, supports `?jobVacancyId=`) | ADMIN, EMPLOYEE, AGENCY | `READ_CANDIDATE` |
| `GET` | `/candidates/:id` | Get candidate by ID | ADMIN, AGENCY | `READ_CANDIDATE` |
| `PATCH` | `/candidates/:id` | Update candidate | AGENCY | `UPDATE_CANDIDATE` |
| `DELETE` | `/candidates/:id` | Delete candidate | AGENCY | `DELETE_CANDIDATE` |

---

## All Permissions Reference

| Permission Key | Description | Used By Roles |
|----------------|-------------|---------------|
| `CREATE_CLIENT` | Create new clients | ADMIN |
| `READ_CLIENT` | View client information | ADMIN, EMPLOYEE |
| `UPDATE_CLIENT` | Modify client data | ADMIN |
| `DELETE_CLIENT` | Remove clients | ADMIN |
| `CREATE_JOB_TEMPLATE` | Create job templates | ADMIN, EMPLOYEE |
| `READ_JOB_TEMPLATE` | View job templates | ADMIN, EMPLOYEE |
| `UPDATE_JOB_TEMPLATE` | Modify job templates | ADMIN, EMPLOYEE |
| `DELETE_JOB_TEMPLATE` | Remove job templates | ADMIN |
| `CREATE_JOB_VACANCY` | Create job vacancies | EMPLOYEE |
| `READ_JOB_VACANCY` | View job vacancies | ADMIN, EMPLOYEE, AGENCY |
| `UPDATE_JOB_VACANCY` | Modify job vacancies & assign agencies | EMPLOYEE |
| `DELETE_JOB_VACANCY` | Remove job vacancies | EMPLOYEE |
| `CREATE_CANDIDATE` | Create candidates | ADMIN, AGENCY |
| `READ_CANDIDATE` | View candidates | ADMIN, EMPLOYEE, AGENCY |
| `UPDATE_CANDIDATE` | Modify candidates | AGENCY |
| `DELETE_CANDIDATE` | Remove candidates | AGENCY |

---

## Role Summary

| Role | Description | Access Level |
|------|-------------|--------------|
| `ADMIN` | Super administrator | Full access (bypasses all permission checks via `isSuperAdmin: true`) |
| `EMPLOYEE` | Internal staff | Manages clients, job templates, job vacancies |
| `AGENCY` | External recruitment agency | Manages candidates, views assigned job vacancies |

---

## Default Admin Account

On first startup, the system automatically seeds:
- **Role**: ADMIN (with `isSuperAdmin: true`)
- **User**: Super Admin with credentials from environment variables

Use these credentials to log in and create additional roles, permissions, and users.
