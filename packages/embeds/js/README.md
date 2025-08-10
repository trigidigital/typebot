# 🚀 TrigiDigital JavaScript Library

> 💫 Powerful JavaScript library to embed interactive chat widgets seamlessly into your website

[![NPM Version](https://img.shields.io/npm/v/@trigidigital/js?style=flat-square&color=blue)](https://www.npmjs.com/package/@trigidigital/js)
[![NPM Downloads](https://img.shields.io/npm/dm/@trigidigital/js?style=flat-square&color=green)](https://www.npmjs.com/package/@trigidigital/js)

## ✨ Features

- 🎯 **Zero Configuration** - Works out of the box
- 🌐 **Framework Agnostic** - Use with any web framework or vanilla HTML
- 📱 **Responsive Design** - Perfect on all devices
- ⚡ **Lightweight** - Minimal bundle size impact
- 🎨 **Customizable** - Full theming and styling control
- 🔧 **TypeScript Support** - Built with TypeScript

## 🔧 Installation

### Via npm

```bash
npm install @trigidigital/js
```

### Via yarn

```bash
yarn add @trigidigital/js
```

### Via CDN

```html
<script type="module">
  import TrigiDigital from 'https://cdn.jsdelivr.net/npm/@trigidigital/js@latest/dist/web.js'
  
  TrigiDigital.initStandard({
    bot: 'my-chat-widget',
  })
</script>
```

## 🎯 Usage Methods

### 1. 📦 Standard Embed

Perfect for embedding directly into your page content.

```html
<script type="module">
  import TrigiDigital from "https://cdn.jsdelivr.net/npm/@trigidigital/js@latest/dist/web.js";

  TrigiDigital.initStandard({
    bot: "your-widget-id",
    apiHost: "https://your-domain.com",
  });
</script>

<trigidigital-standard style="width: 100%; height: 600px;"></trigidigital-standard>
```

### 2. 💬 Popup Modal

Great for customer support and lead generation.

```html
<script type="module">
  import TrigiDigital from "https://cdn.jsdelivr.net/npm/@trigidigital/js@latest/dist/web.js";

  TrigiDigital.initPopup({
    bot: "your-widget-id",
    apiHost: "https://your-domain.com",
    autoShowDelay: 3000, // Show after 3 seconds
  });
</script>
```

**Control the popup:**
```javascript
// Open the popup
TrigiDigital.open();

// Close the popup
TrigiDigital.close();

// Toggle popup state
TrigiDigital.toggle();
```

### 3. 🫧 Chat Bubble

Floating chat button with preview messages.

```html
<script type="module">
  import TrigiDigital from "https://cdn.jsdelivr.net/npm/@trigidigital/js@latest/dist/web.js";

  TrigiDigital.initBubble({
    bot: "your-widget-id",
    previewMessage: {
      message: "👋 Need help? Ask me anything!",
      autoShowDelay: 5000,
      avatarUrl: "https://your-domain.com/avatar.jpg",
    },
    theme: {
      button: { 
        backgroundColor: "#0066CC", 
        iconColor: "#FFFFFF",
        size: "large" 
      },
      previewMessage: { 
        backgroundColor: "#ffffff", 
        textColor: "#333333",
        closeButtonColor: "#666666" 
      },
      chatWindow: { 
        backgroundColor: "#ffffff",
        height: "600px",
        width: "400px" 
      },
    },
  });
</script>
```

**Control the bubble:**
```javascript
// Show/hide preview message
TrigiDigital.showPreviewMessage();
TrigiDigital.hidePreviewMessage();

// Open/close chat window
TrigiDigital.open();
TrigiDigital.close();
TrigiDigital.toggle();
```

## 🎨 Advanced Configuration

### Pre-filled Variables

Inject dynamic data into your chat widget:

```javascript
TrigiDigital.initStandard({
  bot: "your-widget-id",
  prefilledVariables: {
    "User Name": "John Doe",
    "Current Page": window.location.href,
    "User Email": "john@example.com",
    "Plan Type": "Premium",
  },
});
```

### Custom Styling

```javascript
TrigiDigital.initBubble({
  bot: "your-widget-id",
  theme: {
    button: {
      backgroundColor: "#FF6B6B",
      iconColor: "#FFFFFF",
      customIconSrc: "https://your-domain.com/custom-icon.svg",
      size: "medium", // small, medium, large
      borderRadius: "50%",
      boxShadow: "0 4px 20px rgba(255, 107, 107, 0.4)",
    },
    chatWindow: {
      backgroundColor: "#F8F9FA",
      borderRadius: "16px",
      maxHeight: "80vh",
      maxWidth: "450px",
    },
    previewMessage: {
      backgroundColor: "#FFFFFF",
      textColor: "#2D3748",
      borderRadius: "12px",
      fontSize: "14px",
    }
  },
});
```

### Event Listeners

```javascript
// Listen for chat events
TrigiDigital.onChatStart(() => {
  console.log("💬 Chat started!");
  // Track analytics, show notifications, etc.
});

TrigiDigital.onChatEnd(() => {
  console.log("👋 Chat ended!");
  // Clean up, save state, etc.
});

TrigiDigital.onMessage((message) => {
  console.log("📩 New message:", message);
  // Handle message events
});
```

## 🌐 Framework Integration

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>My Website with TrigiDigital</title>
</head>
<body>
  <h1>Welcome to my website!</h1>
  
  <script type="module">
    import TrigiDigital from "https://cdn.jsdelivr.net/npm/@trigidigital/js@latest/dist/web.js";
    
    TrigiDigital.initBubble({
      bot: "welcome-assistant",
      previewMessage: {
        message: "👋 Welcome! How can I help you today?",
        autoShowDelay: 2000,
      }
    });
  </script>
</body>
</html>
```

### React Integration

```jsx
import { useEffect } from 'react';

function App() {
  useEffect(() => {
    import('@trigidigital/js').then(({ default: TrigiDigital }) => {
      TrigiDigital.initBubble({
        bot: 'support-chat',
        previewMessage: {
          message: '💬 Questions? We\'re here to help!',
          autoShowDelay: 3000,
        }
      });
    });
  }, []);

  return (
    <div className="App">
      <h1>My React App</h1>
      {/* Your app content */}
    </div>
  );
}
```

### Vue.js Integration

```vue
<template>
  <div id="app">
    <h1>My Vue App</h1>
    <!-- Your app content -->
  </div>
</template>

<script>
export default {
  name: 'App',
  async mounted() {
    const { default: TrigiDigital } = await import('@trigidigital/js');
    
    TrigiDigital.initStandard({
      bot: 'vue-support',
      prefilledVariables: {
        'Framework': 'Vue.js',
        'Version': this.$options.version
      }
    });
  }
}
</script>
```

## 🔧 API Reference

### TrigiDigital.initStandard(config)

Initialize a standard embedded widget.

**Parameters:**
- `bot` (string): Your widget identifier
- `apiHost` (string, optional): Custom API endpoint
- `prefilledVariables` (object, optional): Pre-populate variables
- `theme` (object, optional): Custom styling options

### TrigiDigital.initPopup(config)

Initialize a popup modal widget.

**Parameters:**
- `bot` (string): Your widget identifier
- `apiHost` (string, optional): Custom API endpoint
- `autoShowDelay` (number, optional): Auto-open delay in milliseconds
- `prefilledVariables` (object, optional): Pre-populate variables
- `theme` (object, optional): Custom styling options

### TrigiDigital.initBubble(config)

Initialize a floating chat bubble.

**Parameters:**
- `bot` (string): Your widget identifier
- `apiHost` (string, optional): Custom API endpoint
- `previewMessage` (object, optional): Preview message configuration
- `theme` (object, optional): Comprehensive theming options

## 🛠️ Custom Elements

TrigiDigital automatically registers custom HTML elements:

```html
<!-- Standard widget -->
<trigidigital-standard 
  bot="your-widget-id" 
  style="width: 100%; height: 500px;">
</trigidigital-standard>

<!-- Chat bubble -->
<trigidigital-bubble 
  bot="your-widget-id"
  preview-message="👋 Hi there! Need assistance?">
</trigidigital-bubble>

<!-- Popup trigger -->
<trigidigital-popup 
  bot="your-widget-id"
  auto-show-delay="5000">
</trigidigital-popup>
```

## 🎯 Use Cases

### 💼 Customer Support
```javascript
TrigiDigital.initBubble({
  bot: "customer-support",
  previewMessage: {
    message: "🆘 Need help? Our support team is online!",
    autoShowDelay: 10000,
  },
  theme: {
    button: { backgroundColor: "#28A745", iconColor: "#FFFFFF" }
  }
});
```

### 🎯 Lead Generation
```javascript
TrigiDigital.initPopup({
  bot: "lead-capture",
  autoShowDelay: 30000, // Show after 30 seconds
  prefilledVariables: {
    "Traffic Source": document.referrer,
    "Current Page": window.location.pathname
  }
});
```

### 📚 Knowledge Base
```javascript
TrigiDigital.initStandard({
  bot: "knowledge-assistant",
  prefilledVariables: {
    "User Type": "Documentation Reader",
    "Section": "Getting Started"
  }
});
```

## 🔍 Troubleshooting

### Common Issues

**Widget not showing:**
- ✅ Check that your `bot` ID is correct
- ✅ Verify your API host is accessible
- ✅ Ensure no ad blockers are interfering

**Styling issues:**
- ✅ Check CSS specificity conflicts
- ✅ Verify theme configuration syntax
- ✅ Test in different browsers

**Variable passing:**
- ✅ Ensure variable names match exactly
- ✅ Check that values are properly encoded
- ✅ Verify URL parameters are correctly formatted

### Debug Mode

Enable debug logging:

```javascript
TrigiDigital.initBubble({
  bot: "your-widget-id",
  debug: true, // Enable console logging
});
```