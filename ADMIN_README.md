# Admin Dashboard

This admin dashboard provides comprehensive store management capabilities for the e-commerce platform.

## Features

### 🏠 Dashboard
- **Overview Statistics**: Total products, orders, customers, and revenue
- **Recent Orders**: Latest orders with status tracking
- **Top Products**: Most viewed products
- **Real-time Analytics**: Key performance indicators

### 📦 Product Management
- **Product Listing**: View all products with pagination
- **Add Products**: Create new products with full details
- **Edit Products**: Update product information
- **Delete Products**: Remove products from inventory
- **Product Status**: Manage active/inactive/draft/out-of-stock status
- **Inventory Tracking**: Monitor stock levels

### 📋 Order Management
- **Order Listing**: View all orders with filtering
- **Status Updates**: Change order status (pending, processing, shipped, delivered, cancelled)
- **Order Details**: View complete order information
- **Customer Information**: Access customer details for each order

### 👥 Customer Management
- **Customer Listing**: View all registered customers
- **Customer Details**: Access customer information and order history
- **Role Management**: View user roles (admin/user)
- **Verification Status**: Track email verification status

### 🏷️ Category & Brand Management
- **Categories**: Create, edit, and manage product categories
- **Brands**: Manage product brands
- **Status Control**: Activate/deactivate categories and brands

### 📊 Analytics
- **Revenue Tracking**: Monthly revenue trends
- **Order Analytics**: Orders by status breakdown
- **Top Products**: Best performing products
- **Time Range Filtering**: View data for different periods

### ⚙️ Settings
- **Profile Management**: Update admin profile information
- **Notification Preferences**: Configure email notifications
- **Security Settings**: Change password and security options
- **General Settings**: Timezone, language, and theme preferences

## Access Control

### Authentication
- **Admin Guard**: Only users with "admin" role can access the dashboard
- **Token Verification**: JWT token validation for all requests
- **Automatic Redirect**: Non-admin users are redirected to the main site

### Security Features
- **Role-based Access**: Admin-only functionality
- **Secure API Calls**: All requests include authentication headers
- **Session Management**: Automatic logout on token expiration

## Navigation

The admin dashboard uses a sidebar navigation with the following sections:

1. **Dashboard** (`/admin`) - Main overview
2. **Products** (`/admin/products`) - Product management
3. **Orders** (`/admin/orders`) - Order management
4. **Customers** (`/admin/customers`) - Customer management
5. **Categories** (`/admin/categories`) - Category management
6. **Brands** (`/admin/brands`) - Brand management
7. **Analytics** (`/admin/analytics`) - Analytics and reports
8. **Settings** (`/admin/settings`) - Admin settings

## API Integration

The admin dashboard integrates with the backend API endpoints:

- **Authentication**: `/api/v1/auth/*`
- **Products**: `/api/v1/products/*`
- **Orders**: `/api/v1/orders/*`
- **Users**: `/api/v1/users/*`
- **Categories**: `/api/v1/categories/*`
- **Brands**: `/api/v1/brands/*`

## Getting Started

1. **Login as Admin**: Use an account with admin role
2. **Access Dashboard**: Navigate to `/admin`
3. **Manage Store**: Use the sidebar to navigate between different management sections

## Technical Details

### Technologies Used
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **Heroicons**: Icon library
- **Date-fns**: Date manipulation library

### Components Structure
```
src/
├── app/admin/                 # Admin pages
│   ├── layout.tsx            # Admin layout with guard
│   ├── page.tsx              # Dashboard overview
│   ├── products/             # Product management
│   ├── orders/               # Order management
│   ├── customers/            # Customer management
│   ├── categories/           # Category management
│   ├── brands/               # Brand management
│   ├── analytics/            # Analytics dashboard
│   └── settings/             # Admin settings
└── components/admin/         # Admin-specific components
    ├── AdminGuard.tsx        # Authentication guard
    ├── AdminSidebar.tsx      # Navigation sidebar
    ├── AdminHeader.tsx       # Top header
    ├── DashboardStats.tsx    # Statistics cards
    ├── RecentOrders.tsx      # Recent orders widget
    └── TopProducts.tsx       # Top products widget
```

## Responsive Design

The admin dashboard is fully responsive and works on:
- **Desktop**: Full sidebar navigation
- **Tablet**: Collapsible sidebar
- **Mobile**: Mobile-optimized layout

## Future Enhancements

Potential improvements for the admin dashboard:
- **Bulk Operations**: Bulk edit/delete products and orders
- **Advanced Analytics**: More detailed reporting and charts
- **Email Templates**: Manage email templates
- **Inventory Alerts**: Low stock notifications
- **Export Features**: Export data to CSV/Excel
- **User Permissions**: Granular permission system
- **Audit Logs**: Track admin actions
- **Theme Customization**: Dark mode and custom themes
