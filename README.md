# Nike Ecommerce Frontend

A modern, responsive ecommerce frontend built with Next.js 15, TypeScript, TailwindCSS, and inspired by Nike's design aesthetic.

## 🚀 Features

- **Modern Design**: Nike-inspired UI with clean, minimalist aesthetics
- **Responsive Layout**: Mobile-first design that works on all devices
- **Product Catalog**: Browse products with search, filtering, and sorting
- **Shopping Cart**: Add, remove, and manage cart items
- **User Authentication**: Login and registration forms
- **Smooth Animations**: Framer Motion powered interactions
- **TypeScript**: Full type safety throughout the application
- **TailwindCSS**: Utility-first CSS framework for rapid development

## 🛠 Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Forms**: React Hook Form
- **HTTP Client**: Axios
- **Authentication**: Custom JWT-based authentication

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Update the `.env.local` file with your configuration:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:8080/api/v2
   NODE_ENV=development
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart
│   ├── products/          # Product listing
│   └── page.tsx           # Homepage
├── components/            # Reusable components
│   ├── layout/           # Layout components (Header, Footer)
│   ├── product/          # Product-related components
│   ├── ui/               # UI components
│   └── auth/             # Authentication components
├── lib/                  # Utility libraries
│   └── api.ts           # API configuration
├── types/                # TypeScript type definitions
├── hooks/                # Custom React hooks
└── utils/                # Utility functions
```

## 🎨 Design System

### Colors
- **Primary**: Black (#000000)
- **Secondary**: Gray scale (50-900)
- **Accent**: Red (#EF4444) for sales/badges
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)

### Typography
- **Headings**: Bold, large text for hierarchy
- **Body**: Regular weight for readability
- **Buttons**: Semibold for emphasis

### Components
- **Cards**: Rounded corners, subtle shadows
- **Buttons**: Black background, white text, hover effects
- **Forms**: Clean inputs with focus states
- **Navigation**: Sticky header with smooth transitions

## 🔧 Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Code Style

- Use TypeScript for all new files
- Follow ESLint configuration
- Use TailwindCSS utility classes
- Implement responsive design
- Add proper error handling
- Write meaningful component names

## 🔌 API Integration

The frontend is configured to work with the backend API. Update the API endpoints in `src/lib/api.ts` to match your backend configuration.

### Key API Endpoints

- **Products**: `/api/v1/products`
- **Categories**: `/api/v1/categories`
- **Cart**: `/api/v1/cart`
- **Orders**: `/api/v1/orders`
- **Authentication**: `/api/v1/auth`

## 🚀 Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically on push

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- DigitalOcean App Platform
- Railway

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🔮 Roadmap

- [ ] Product detail pages
- [ ] User profile management
- [ ] Order history
- [ ] Wishlist functionality
- [ ] Product reviews and ratings
- [ ] Advanced filtering options
- [ ] Payment integration
- [ ] Email notifications
- [ ] PWA features
- [ ] Internationalization (i18n)

---

Built with ❤️ using Next.js and TailwindCSS
