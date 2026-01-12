# Suntop - سودانكو

A modern, responsive mobile PWA application built with React, Vite, and Tailwind CSS.

## Features

- ✨ Pixel-perfect implementation of Figma designs
- 📱 Fully responsive across all devices (mobile, tablet, desktop)
- 🌐 PWA (Progressive Web App) support
- 🎨 Modern UI with custom branding (Suntop/Soudanco)
- 🔄 RTL (Right-to-Left) support for Arabic content
- ⚡ Fast performance with Vite
- 🎯 TypeScript for type safety

## Pages

1. **Splash Screen** - Welcome screen with brand logo
2. **Login** - User authentication page
3. **Signup** - New user registration with success modal
4. **Notifications** - Comprehensive notifications management

## Tech Stack

- **React** - UI library
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **TypeScript** - Type safety
- **React Router** - Client-side routing

## Getting Started

### Development

```bash
pnpm install
pnpm dev
```

The app will be available at the development server URL.

### Build

```bash
pnpm build
```

### Production

```bash
pnpm start
```

## Design System

### Colors

- **Primary (Orange)**: `#FD7E14`
- **Brand Yellow**: `#FFCD39`
- **Gray Scale**: `#F8F9FA`, `#CED4DA`, `#ADB5BD`
- **Text**: `#07102D` (primary), `#7C7C7C` (secondary)
- **Border**: `#DEE2E6`

### Typography

- **Font Family**: Noto Sans Arabic
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold), 700 (bold)

### Components

- InputField - Rounded input fields with RTL support
- PrimaryButton - Main CTA button with orange background
- TextLink - Secondary action links
- Logo - Suntop brand logo component
- PageHeader - Page navigation header
- NotificationItem - Individual notification card

## Project Structure

```
client/
  ├── components/     # Reusable UI components
  ├── pages/          # Page components
  ├── App.tsx         # Main app with routing
  └── global.css      # Global styles and CSS variables
public/
  ├── manifest.json   # PWA manifest
  └── icon.svg        # App icon
```

## License

Copyright © 2025 Suntop
