# 🛒 Mobile Shop - Full-Stack E-Commerce Platform

Mobile Shop is a modern, full-stack e-commerce platform built with Next.js 15, featuring a comprehensive mobile phone marketplace with advanced seller/admin dashboard, secure payment processing, and real-time inventory management.

## 🚀 Features

### Customer Features
- **🔐 Secure Authentication** - Clerk-powered user authentication with role-based access
- **📱 Product Catalog** - Dynamic product listings with search, filtering, and pagination
- **🛒 Shopping Cart** - Real-time cart management with quantity controls
- **💳 Payment Processing** - Stripe integration for secure online payments
- **📦 Order Management** - Complete order lifecycle with status tracking
- **📍 Address Management** - Multiple delivery addresses with CRUD operations
- **📄 Digital Receipts** - Automated receipt generation for completed orders
- **📱 Responsive Design** - Mobile-first design with Tailwind CSS

### Seller/Admin Features
- **📊 Analytics Dashboard** - Comprehensive sales analytics and performance metrics
- **📦 Product Management** - Add, edit, and manage product inventory
- **📋 Order Management** - View and update order statuses
- **💰 Revenue Tracking** - Detailed revenue analysis with payment method breakdown
- **📈 Performance Charts** - Visual data representation for business insights
- **🔄 Stock Management** - Real-time inventory tracking and updates

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Frontend** | Next.js 15, React 19 | Modern React framework with App Router |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Authentication** | Clerk | Secure user authentication and authorization |
| **Database** | MongoDB | NoSQL database for data persistence |
| **ORM** | Mongoose | MongoDB object modeling |
| **Payment** | Stripe | Secure payment processing |
| **Background Jobs** | Inngest | Reliable background task processing |
| **Image Storage** | Cloudinary | Cloud image management |
| **Deployment** | Vercel | Serverless deployment platform |

## 📁 Project Structure

```
Mobileshop/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── address/       # Address management APIs
│   │   ├── cart/          # Shopping cart APIs
│   │   ├── order/         # Order management APIs
│   │   ├── payment/       # Payment processing APIs
│   │   ├── products/      # Product management APIs
│   │   ├── receipt/       # Receipt generation APIs
│   │   └── seller/        # Seller dashboard APIs
│   ├── cart/              # Shopping cart page
│   ├── checkout/          # Checkout process
│   ├── my-orders/         # Order history
│   ├── product/           # Product details
│   ├── profile/           # User profile management
│   └── seller/            # Seller dashboard pages
├── components/            # Reusable React components
├── config/               # Configuration files
├── context/              # React context providers
├── lib/                  # Utility functions
├── models/               # MongoDB schemas
└── assets/               # Static assets and images
```

## 🔧 Key Components

### Data Models
- **Product Model** - Product information with variants, pricing, and stock
- **Order Model** - Order details with payment status and shipping info
- **User Model** - User profiles with cart and address data
- **Address Model** - Delivery address management
- **Receipt Model** - Digital receipt generation

### Core Features

#### 🛒 Shopping Experience
- **Product Discovery**: Advanced search with brand filtering and pagination
- **Cart Management**: Real-time cart updates with quantity controls
- **Checkout Process**: Multi-step checkout with address selection and payment
- **Order Tracking**: Complete order lifecycle from placement to delivery

#### 💳 Payment System
- **Stripe Integration**: Secure payment processing with multiple payment methods
- **COD Support**: Cash on delivery option for local orders
- **Payment Webhooks**: Real-time payment status updates
- **Receipt Generation**: Automated digital receipts for completed orders

#### 📊 Seller Dashboard
- **Analytics Overview**: Sales metrics, revenue tracking, and performance indicators
- **Order Management**: View, update, and track order statuses
- **Product Management**: Add, edit, and manage product inventory
- **Stock Management**: Real-time inventory tracking with low stock alerts

#### 🔐 Security & Authentication
- **Role-Based Access**: Separate user and admin interfaces
- **Secure Routes**: Protected routes with authentication middleware
- **Payment Security**: PCI-compliant payment processing
- **Data Validation**: Comprehensive input validation and sanitization

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- MongoDB database
- Stripe account for payments
- Clerk account for authentication
- Cloudinary account for image storage

### Environment Variables
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key

# Payment Processing
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Image Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Background Jobs
INNGEST_EVENT_KEY=your_inngest_event_key
INNGEST_SIGNING_KEY=your_inngest_signing_key
```

### Installation
```bash
# Clone the repository
git clone https://github.com/viperwiz/mobileshop.git
cd mobileshop

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local

# Run development server
npm run dev
```

### Database Setup
```bash
# The application will automatically create collections
# Ensure MongoDB is running and accessible
```

## 📱 Key Pages & Features

### Customer Interface
- **Home Page** (`/`) - Featured products, banners, and product listings
- **Product Catalog** (`/all-products`) - Complete product listing with filters
- **Product Details** (`/product/[id]`) - Detailed product information
- **Shopping Cart** (`/cart`) - Cart management and checkout initiation
- **Checkout** (`/checkout`) - Payment processing and order placement
- **Order History** (`/my-orders`) - View order status and history
- **User Profile** (`/profile`) - Address and account management

### Seller Interface
- **Dashboard** (`/seller/dashboard`) - Analytics and performance metrics
- **Product Management** (`/seller/product-list`) - Manage product inventory
- **Order Management** (`/seller/orders`) - View and update orders
- **Product Editor** (`/seller/edit/[id]`) - Add/edit product information

## 🔄 API Endpoints

### Product Management
- `GET /api/products/list` - Get product catalog with filtering
- `POST /api/products/add` - Add new product
- `GET /api/products/[id]` - Get product details
- `PUT /api/products/[id]` - Update product

### Order Management
- `POST /api/order/create` - Create new order
- `GET /api/order/get` - Get user orders
- `PUT /api/order/status` - Update order status
- `POST /api/order/cancel` - Cancel order

### Payment Processing
- `POST /api/payment/stripe/create-payment-intent` - Create Stripe payment intent
- `POST /api/payment/stripe/webhook` - Handle Stripe webhooks

### Cart Management
- `GET /api/cart/get` - Get user cart
- `POST /api/cart/update` - Update cart items

### Address Management
- `GET /api/address/get` - Get user addresses
- `POST /api/address/add` - Add new address
- `PUT /api/address/update` - Update address
- `DELETE /api/address/delete` - Delete address

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Modern Interface**: Clean, intuitive design with smooth animations
- **Loading States**: Comprehensive loading indicators and skeleton screens
- **Error Handling**: User-friendly error messages and validation
- **Toast Notifications**: Real-time feedback for user actions
- **Image Optimization**: Next.js Image component for optimized loading

## 🔒 Security Features

- **Authentication**: Clerk-powered secure authentication
- **Authorization**: Role-based access control
- **Input Validation**: Comprehensive data validation
- **Payment Security**: PCI-compliant payment processing
- **CSRF Protection**: Built-in CSRF protection
- **Rate Limiting**: API rate limiting for abuse prevention



### Environment Setup
1. Set up all required environment variables in Vercel dashboard
2. Configure custom domains if needed
3. Set up webhook endpoints for payment processing
4. Configure Clerk authentication settings

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.



---

**MObile Shop** - Modern E-Commerce Made Simple 🛒✨



