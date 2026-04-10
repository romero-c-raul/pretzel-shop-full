# Pretzel Store - React SPA

A modern React Single Page Application (SPA) for a pretzel store, converted from the original HTML template.

## Features

- 🛍️ Product browsing and details
- 🛒 Shopping cart with state management
- 💳 Checkout form
- 📱 Responsive design with mobile menu
- 🎨 Tailwind CSS styling
- 🔄 React Router for navigation
- 📦 Context API for cart state management

## Tech Stack

- **React 18** - UI library
- **React Router DOM** - Client-side routing
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling (via CDN)

## Project Structure

```
├── public/
│   └── index.html          # HTML template
├── src/
│   ├── components/         # React components
│   │   ├── Header.jsx      # Navigation header
│   │   ├── Home.jsx        # Home/Hero section
│   │   ├── Products.jsx    # Product listing
│   │   ├── ProductDetail.jsx # Product detail page
│   │   ├── Cart.jsx        # Shopping cart
│   │   ├── Checkout.jsx    # Checkout form
│   │   ├── ThankYou.jsx    # Order confirmation
│   │   └── Footer.jsx      # Footer
│   ├── context/
│   │   └── CartContext.js  # Cart state management
│   ├── data/
│   │   └── products.js     # Product data
│   ├── App.jsx             # Main app component
│   └── main.jsx            # Entry point
├── package.json
├── vite.config.js
└── README.md
```

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173` (or the port shown in the terminal).

## Build

Build for production:
```bash
npm run build
```

The production build will be in the `dist` directory.

## Preview Production Build

Preview the production build:
```bash
npm run preview
```

## Routes

- `/` - Home page
- `/products` - Product listing
- `/products/:id` - Product detail page
- `/cart` - Shopping cart
- `/checkout` - Checkout form
- `/thank-you` - Order confirmation

## Features Implemented

- ✅ Responsive navigation with mobile menu
- ✅ Product grid with dynamic rendering
- ✅ Product detail pages
- ✅ Shopping cart functionality
- ✅ Add/remove items from cart
- ✅ Update item quantities
- ✅ Cart totals calculation
- ✅ Checkout form with validation
- ✅ Order confirmation page

## Notes

- The cart uses React Context API for state management
- Product data is stored in `src/data/products.js`
- All styling uses Tailwind CSS via CDN
- The app is fully responsive and works on mobile, tablet, and desktop

