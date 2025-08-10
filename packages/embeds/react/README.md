# ⚛️ TrigiDigital React Components

> 🚀 Beautiful, type-safe React components for embedding interactive chat widgets

[![NPM Version](https://img.shields.io/npm/v/@trigidigital/react?style=flat-square&color=blue)](https://www.npmjs.com/package/@trigidigital/react)
[![NPM Downloads](https://img.shields.io/npm/dm/@trigidigital/react?style=flat-square&color=green)](https://www.npmjs.com/package/@trigidigital/react)
[![React](https://img.shields.io/badge/React-16%2B-61dafb?style=flat-square)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-3178c6?style=flat-square)](https://www.typescriptlang.org)

## ✨ Features

- ⚛️ **React Native** - Built specifically for React applications
- 🎯 **Zero Configuration** - Works out of the box
- 📱 **Responsive** - Perfect on all screen sizes
- 🎨 **Customizable** - Full control over themes and styling
- 🔧 **TypeScript** - Full type safety and autocomplete
- ⚡ **Lightweight** - Minimal impact on bundle size
- 🪝 **React Hooks** - Modern React patterns and best practices

## 📦 Installation

### npm

```bash
npm install @trigidigital/react
```

### yarn

```bash
yarn add @trigidigital/react
```

### pnpm

```bash
pnpm add @trigidigital/react
```

## 🎯 Quick Start

### Standard Widget

Perfect for embedding chat directly in your page layout.

```tsx
import { Standard } from "@trigidigital/react";

function App() {
  return (
    <div className="container">
      <h1>Welcome to our website!</h1>
      
      <Standard
        bot="your-widget-id"
        style={{ 
          width: "100%", 
          height: "600px",
          borderRadius: "12px"
        }}
      />
    </div>
  );
}
```

### Popup Modal

Great for customer support and lead generation.

```tsx
import { Popup } from "@trigidigital/react";

function App() {
  return (
    <div className="app">
      {/* Your app content */}
      
      <Popup 
        bot="support-chat"
        autoShowDelay={5000}
        theme={{
          popup: {
            backgroundColor: "#FFFFFF",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)"
          }
        }}
      />
    </div>
  );
}
```

### Chat Bubble

Floating chat button with preview messages.

```tsx
import { Bubble } from "@trigidigital/react";

function App() {
  return (
    <div className="app">
      {/* Your app content */}
      
      <Bubble
        bot="sales-assistant"
        previewMessage={{
          message: "👋 Hi! How can we help you today?",
          autoShowDelay: 3000,
          avatarUrl: "/avatar.jpg",
        }}
        theme={{
          button: { 
            backgroundColor: "#FF6B6B", 
            iconColor: "#FFFFFF",
            size: "large"
          },
          previewMessage: { 
            backgroundColor: "#FFFFFF", 
            textColor: "#333333" 
          },
          chatWindow: { 
            backgroundColor: "#F8F9FA",
            height: "600px"
          },
        }}
      />
    </div>
  );
}
```

## 🎨 Advanced Usage

### Pre-filled Variables

Inject dynamic data from your React app:

```tsx
import { Standard } from "@trigidigital/react";
import { useUser } from "./hooks/useUser";

function Dashboard() {
  const { user, subscription } = useUser();
  
  return (
    <Standard
      bot="dashboard-assistant"
      prefilledVariables={{
        "User Name": user.name,
        "User Email": user.email,
        "Plan Type": subscription.plan,
        "Current Page": "Dashboard",
        "Login Time": new Date().toISOString(),
      }}
      style={{ width: "100%", height: "500px" }}
    />
  );
}
```

### Dynamic Configuration

Update configuration based on app state:

```tsx
import { useState, useEffect } from "react";
import { Bubble } from "@trigidigital/react";

function App() {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate user loading
    setTimeout(() => {
      setUser({ name: "John", role: "premium" });
      setIsLoading(false);
    }, 1000);
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app">
      {/* Your app content */}
      
      <Bubble
        bot={user.role === "premium" ? "premium-support" : "general-support"}
        previewMessage={{
          message: user.role === "premium" 
            ? "🌟 Premium support is here to help!" 
            : "💬 Questions? We're here to help!",
          autoShowDelay: 2000,
        }}
        prefilledVariables={{
          "User Name": user.name,
          "User Role": user.role,
        }}
        theme={{
          button: {
            backgroundColor: user.role === "premium" ? "#FFD700" : "#0066CC",
          }
        }}
      />
    </div>
  );
}
```

### Custom Styling with CSS Modules

```tsx
// ChatPage.module.css
.chatContainer {
  border: 2px solid #e2e8f0;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.chatContainer:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: box-shadow 0.2s ease;
}
```

```tsx
// ChatPage.tsx
import { Standard } from "@trigidigital/react";
import styles from "./ChatPage.module.css";

function ChatPage() {
  return (
    <div className="container">
      <h1>Customer Support</h1>
      
      <Standard
        bot="customer-support"
        className={styles.chatContainer}
        style={{ width: "100%", height: "600px" }}
        theme={{
          chat: {
            backgroundColor: "#FFFFFF",
            borderRadius: "0", // Override since container handles border-radius
          }
        }}
      />
    </div>
  );
}
```

### Integration with React Router

```tsx
import { useLocation } from "react-router-dom";
import { Bubble } from "@trigidigital/react";

function Layout({ children }) {
  const location = useLocation();
  
  return (
    <div className="layout">
      <nav>
        {/* Navigation */}
      </nav>
      
      <main>
        {children}
      </main>
      
      <Bubble
        bot="route-specific-bot"
        prefilledVariables={{
          "Current Route": location.pathname,
          "Previous Route": location.state?.from || "direct",
        }}
        previewMessage={{
          message: getMessageForRoute(location.pathname),
          autoShowDelay: 5000,
        }}
      />
    </div>
  );
}

function getMessageForRoute(pathname: string): string {
  switch (pathname) {
    case "/pricing":
      return "💰 Questions about pricing? Let's chat!";
    case "/features":
      return "✨ Want to know more about our features?";
    case "/support":
      return "🆘 Need help? Our support team is ready!";
    default:
      return "👋 Hi there! How can we assist you?";
  }
}
```

## 🎮 Programmatic Control

### Using Refs and Imperative API

```tsx
import { useRef } from "react";
import { Popup } from "@trigidigital/react";
import type { PopupRef } from "@trigidigital/react";

function App() {
  const popupRef = useRef<PopupRef>(null);

  const handleOpenChat = () => {
    popupRef.current?.open();
  };

  const handleCloseChat = () => {
    popupRef.current?.close();
  };

  const handleToggleChat = () => {
    popupRef.current?.toggle();
  };

  return (
    <div className="app">
      <header>
        <button onClick={handleOpenChat}>
          💬 Open Chat
        </button>
        <button onClick={handleToggleChat}>
          🔄 Toggle Chat
        </button>
      </header>
      
      <Popup
        ref={popupRef}
        bot="header-controlled-chat"
      />
    </div>
  );
}
```

### Using Command Functions

```tsx
import { open, close, toggle, showPreviewMessage, hidePreviewMessage } from "@trigidigital/react";

function ChatControls() {
  return (
    <div className="chat-controls">
      <button onClick={() => open()}>
        🟢 Open Chat
      </button>
      
      <button onClick={() => close()}>
        🔴 Close Chat
      </button>
      
      <button onClick={() => toggle()}>
        🔄 Toggle Chat
      </button>
      
      <button onClick={() => showPreviewMessage()}>
        💬 Show Preview
      </button>
      
      <button onClick={() => hidePreviewMessage()}>
        🙈 Hide Preview
      </button>
    </div>
  );
}
```

## 🌐 Framework Integration

### Next.js App Router

```tsx
// app/chat/page.tsx
"use client";

import { Standard } from "@trigidigital/react";
import { useSearchParams } from "next/navigation";

export default function ChatPage() {
  const searchParams = useSearchParams();
  const source = searchParams.get('source') || 'direct';
  
  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Chat Support</h1>
      
      <Standard
        bot="nextjs-support"
        prefilledVariables={{
          "Traffic Source": source,
          "Page": "Chat Support",
        }}
        style={{ 
          width: "100%", 
          height: "600px",
          border: "1px solid #e5e7eb",
          borderRadius: "8px"
        }}
      />
    </main>
  );
}
```

### Next.js Pages Router

```tsx
// pages/support.tsx
import { GetServerSideProps } from "next";
import { Bubble } from "@trigidigital/react";

interface SupportPageProps {
  userAgent: string;
  timestamp: string;
}

export default function SupportPage({ userAgent, timestamp }: SupportPageProps) {
  return (
    <div className="min-h-screen">
      <h1>Support Page</h1>
      
      <Bubble
        bot="support-page"
        prefilledVariables={{
          "User Agent": userAgent,
          "Page Load Time": timestamp,
        }}
        previewMessage={{
          message: "🚀 Need help? Our support team is online!",
          autoShowDelay: 3000,
        }}
      />
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ req }) => {
  return {
    props: {
      userAgent: req.headers['user-agent'] || 'unknown',
      timestamp: new Date().toISOString(),
    },
  };
};
```

### Remix

```tsx
// app/routes/chat.tsx
import { json, LoaderFunction } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import { Standard } from "@trigidigital/react";

export const loader: LoaderFunction = async ({ request }) => {
  const url = new URL(request.url);
  
  return json({
    referrer: request.headers.get('referer'),
    timestamp: new Date().toISOString(),
    searchParams: Object.fromEntries(url.searchParams),
  });
};

export default function ChatRoute() {
  const data = useLoaderData<typeof loader>();
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Customer Support</h1>
      
      <Standard
        bot="remix-support"
        prefilledVariables={{
          "Referrer": data.referrer || "direct",
          "Load Time": data.timestamp,
          ...data.searchParams,
        }}
        style={{ 
          width: "100%", 
          height: "500px",
          borderRadius: "12px"
        }}
      />
    </div>
  );
}
```

## 🔧 TypeScript Support

### Component Props Types

```tsx
import type { 
  StandardProps, 
  PopupProps, 
  BubbleProps,
  Theme,
  PreviewMessage,
  PrefilledVariables
} from "@trigidigital/react";

// Extend component props
interface CustomStandardProps extends StandardProps {
  onChatStart?: () => void;
  onChatEnd?: () => void;
  className?: string;
}

function CustomStandard({ 
  onChatStart, 
  onChatEnd, 
  className,
  ...props 
}: CustomStandardProps) {
  return (
    <div className={className}>
      <Standard 
        {...props}
        onReady={onChatStart}
        onClose={onChatEnd}
      />
    </div>
  );
}
```

### Custom Theme Types

```tsx
import type { Theme } from "@trigidigital/react";

const customTheme: Theme = {
  button: {
    backgroundColor: "#FF6B6B",
    iconColor: "#FFFFFF",
    size: "large",
    borderRadius: "50%",
    boxShadow: "0 4px 20px rgba(255, 107, 107, 0.4)",
  },
  previewMessage: {
    backgroundColor: "#FFFFFF",
    textColor: "#333333",
    borderRadius: "12px",
    fontSize: "14px",
    closeButtonColor: "#666666",
  },
  chatWindow: {
    backgroundColor: "#F8F9FA",
    borderRadius: "16px",
    maxHeight: "80vh",
    maxWidth: "450px",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1)",
  },
};
```

## 📚 API Reference

### Standard Component

```tsx
interface StandardProps {
  bot: string;
  apiHost?: string;
  prefilledVariables?: Record<string, string>;
  theme?: Partial<Theme>;
  style?: React.CSSProperties;
  className?: string;
  onReady?: () => void;
  onError?: (error: Error) => void;
}
```

### Popup Component

```tsx
interface PopupProps {
  bot: string;
  apiHost?: string;
  autoShowDelay?: number;
  prefilledVariables?: Record<string, string>;
  theme?: Partial<Theme>;
  onOpen?: () => void;
  onClose?: () => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
}
```

### Bubble Component

```tsx
interface BubbleProps {
  bot: string;
  apiHost?: string;
  previewMessage?: PreviewMessage;
  prefilledVariables?: Record<string, string>;
  theme?: Partial<Theme>;
  onOpen?: () => void;
  onClose?: () => void;
  onPreviewShow?: () => void;
  onPreviewHide?: () => void;
  onReady?: () => void;
  onError?: (error: Error) => void;
}
```

### Theme Interface

```tsx
interface Theme {
  button: {
    backgroundColor: string;
    iconColor: string;
    size: "small" | "medium" | "large";
    borderRadius: string;
    boxShadow: string;
    customIconSrc?: string;
  };
  previewMessage: {
    backgroundColor: string;
    textColor: string;
    borderRadius: string;
    fontSize: string;
    closeButtonColor: string;
  };
  chatWindow: {
    backgroundColor: string;
    borderRadius: string;
    maxHeight: string;
    maxWidth: string;
    boxShadow: string;
  };
}
```

## 🎯 Common Use Cases

### 💼 Customer Support Dashboard

```tsx
import { useEffect, useState } from "react";
import { Standard } from "@trigidigital/react";

function SupportDashboard() {
  const [tickets, setTickets] = useState([]);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Load user and tickets
    fetchUserAndTickets().then(data => {
      setUser(data.user);
      setTickets(data.tickets);
    });
  }, []);

  return (
    <div className="dashboard">
      <div className="sidebar">
        <h2>Your Tickets ({tickets.length})</h2>
        {/* Ticket list */}
      </div>
      
      <div className="main-content">
        <Standard
          bot="support-dashboard"
          prefilledVariables={{
            "User ID": user?.id,
            "Active Tickets": tickets.length.toString(),
            "User Tier": user?.tier,
            "Last Login": user?.lastLogin,
          }}
          style={{ 
            width: "100%", 
            height: "calc(100vh - 120px)",
            border: "1px solid #e2e8f0",
            borderRadius: "8px"
          }}
        />
      </div>
    </div>
  );
}
```

### 🛒 E-commerce Integration

```tsx
import { useCart } from "./hooks/useCart";
import { Bubble } from "@trigidigital/react";

function EcommerceLayout({ children }) {
  const { items, total } = useCart();
  
  return (
    <div className="layout">
      {children}
      
      <Bubble
        bot="shopping-assistant"
        previewMessage={{
          message: items.length > 0 
            ? `🛒 Need help with your cart? (${items.length} items)` 
            : "🛍️ Looking for something? Let us help!",
          autoShowDelay: 10000,
        }}
        prefilledVariables={{
          "Cart Items": items.length.toString(),
          "Cart Total": total.toString(),
          "Cart Contents": items.map(item => item.name).join(", "),
        }}
        theme={{
          button: {
            backgroundColor: "#FF6B35",
            iconColor: "#FFFFFF",
            size: "large"
          }
        }}
      />
    </div>
  );
}
```

### 📊 Analytics Integration

```tsx
import { useAnalytics } from "./hooks/useAnalytics";
import { Standard } from "@trigidigital/react";

function AnalyticsDashboard() {
  const { trackEvent } = useAnalytics();
  
  const handleChatStart = () => {
    trackEvent("chat_started", {
      page: "analytics_dashboard",
      timestamp: Date.now(),
    });
  };
  
  const handleChatEnd = () => {
    trackEvent("chat_ended", {
      page: "analytics_dashboard",
      duration: Date.now(), // Calculate actual duration
    });
  };

  return (
    <div className="analytics-dashboard">
      <h1>Analytics Dashboard</h1>
      
      <Standard
        bot="analytics-assistant"
        onReady={handleChatStart}
        onClose={handleChatEnd}
        prefilledVariables={{
          "Dashboard": "Analytics",
          "User Role": "Analyst",
        }}
        style={{ 
          width: "100%", 
          height: "500px",
          marginTop: "20px"
        }}
      />
    </div>
  );
}
```

## 🔍 Troubleshooting

### Common Issues

**Component not rendering:**
```tsx
// ❌ Wrong - Missing bot prop
<Standard />

// ✅ Correct - Bot prop provided
<Standard bot="your-widget-id" />
```

**TypeScript errors:**
```bash
# Install type definitions
npm install --save-dev @types/react
```

**Styling conflicts:**
```tsx
// Use CSS-in-JS or scoped styles
<Standard
  bot="your-widget-id"
  style={{ 
    // Explicit styles override conflicts
    position: "relative",
    zIndex: 1000,
  }}
/>
```

### Debug Mode

```tsx
<Standard
  bot="debug-widget"
  // Add debug logging (if available in actual implementation)
  onReady={() => console.log("Chat ready!")}
  onError={(error) => console.error("Chat error:", error)}
/>
```