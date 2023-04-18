# Portal Page Proxy Authorization

This application provides proxy access to the remote host via different URL (localhost url)

## Requirements

- [NodeJs 16+](https://nodejs.org/en/)

## Installing

```shell
npm i
```

## Usage

Copy `.env.example` file to `.env` and set correct values for each env variable.

You can set only `REMOTE_HOST` variable.

Build and start the application via following command

```shell
npm run build
npm run start
```

Your browser may open the local version of the target page after the application start.
When the browser doesn't open the link, find it in the console and open it itself.

The message with the link looks like this:

> Try to open http://localhost:2000 in the browser

Sign in at http://localhost:2000. This action will provide backend server authentication credentials to localhost in your browser.
After this, you can use a proxy solution with your framework to have access to the backend via localhost.

> Warning! You must authorize with local server credentials. If you redirected to Okta, use this path to sign in http://localhost:2000/auth/index/login

### Framework configuration

`process.env.BACKEND_BASE_URL` must be equal to `REMOTE_HOST` env variable in proxy configuration or must be `undefined` if you plan to use the proxy for each request to the backend API.

### Vite + React.js or Vite + Vue.js

When you use Vite builder with you framework, you can configure Vite to use backend proxy.

```typescript
// vite.config.ts
import { defineConfig, loadEnv, ProxyOptions } from "vite";

export default ({ mode }) => {
  // Need to provide env variables into vite application
  process.env = { ...process.env, ...loadEnv(mode, process.cwd(), "") };

  return defineConfig({
    // ... configuration opts

    server: {
      /**
       * Required config part to use backend proxy
       */
      proxy: {
        ...["/api", "/home", "/data"]
          .map((key) => {
            return {
              [key]: {
                // You can define `BACKEND_BASE_URL` env variables in `.env` file to use proxy solution only for providing authentication
                // Also you can use `http://localhost:2000` (default proxy URL) for all requests
                target: `${
                  process.env.BACKEND_BASE_URL || "http://localhost:2000"
                }`,
                changeOrigin: true,
                secure: false,
              } as ProxyOptions,
            };
          })
          .reduce((proxyOptions, proxyKeyOptions) => {
            return Object.assign(proxyOptions, proxyKeyOptions);
          }, {} as Record<string, string | ProxyOptions>),
      },
    },
  });
};
```

### React.js

First you need to install `http-proxy-middleware` package as dev dependency

```shell
npm i --save-dev http-proxy-middleware
```

When package is installed you need to create `setupProxy.js` in `src` directory with content as you can see below

```javascript
// setupProxy.js
const { createProxyMiddleware } = require("http-proxy-middleware");

module.exports = function (app) {
  app.use(
    ["/api", "/home", "/data"],
    createProxyMiddleware({
      target: `${process.env.BACKEND_BASE_URL || "http://localhost:2000"}`,
      changeOrigin: true,
    })
  );
};
```

### React.js + Next.js

You need to create/update you Next.js configuration in file `next.config.js` that placed in project root

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... configuration opts

  rewrites: async () => {
    return ["/api", "/home", "/data"].map((path) => {
      return {
        source: `${path}/:q*`,
        destination: `${
          process.env.BACKEND_BASE_URL || "http://localhost:2000"
        }${path}/:q*`,
      };
    });
  },
};

module.exports = nextConfig;
```
