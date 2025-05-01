---
layout: post
title: Fixing React Routing in IIS
description: Sin tantum modo ad indicia veteris memoriae cognoscenda, curiosorum. Haec et tu ita posuisti, et verba vestra sunt. Idemne potest esse dies...
date: 2025-05-02 01:00:00 +0400
image: "/images/110.jpg"
tags: [Work]
---

When deploying a React application on **IIS**, client-side routing using **React Router** may not work as expected. If you navigate directly to a route (e.g., `/viewpage`), IIS will attempt to locate a physical file or directory, resulting in a **404 Not Found** error.
To resolve this, you need to configure IIS to **rewrite all requests** to `index.html`, allowing React Router to handle routing.

### Solution: Configure `web.config` for IIS

Create a `web.config` file in the **root directory** of your deployed React app (where `index.html` is located) and add the following configuration:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <!-- Redirect all routes to index.html except for actual files and directories -->
        <rule name="React SPA Routing" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

```javascript
function greet(name) {
  console.log("Hello, " + name + "!");
}
```

#### **Steps to Apply the Fix**

1. **Ensure the IIS URL Rewrite Module is installed**

   - If not installed, download it from Microsoft's official site.

2. **Place the `web.config` file in the root of your React build folder** (next to `index.html`).
3. **Restart IIS**

   - Open IIS Manager
   - Restart the **application pool** or the entire **website**

4. **Clear the browser cache and test the routes**

   - Try accessing both `/` and `/viewpage` directly in the browser.

After applying this configuration, IIS will serve `index.html` for all unmatched routes, and React Router will correctly handle navigation.
