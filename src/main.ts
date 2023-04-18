import express from "express";
import {
  createProxyMiddleware,
  responseInterceptor,
} from "http-proxy-middleware";
import { fileTypeFromBuffer } from "file-type";
import open from "open";
import * as console from "console";
import * as process from "process";

const app = express();

const { REMOTE_HOST_SCHEME, REMOTE_HOST, LOCAL_HOST_PORT = 2000 } = process.env;

const scheme = REMOTE_HOST_SCHEME || "https";
const host = REMOTE_HOST || "example.org";
const localPort = Number.isNaN(Number(LOCAL_HOST_PORT))
  ? 2000
  : Number(LOCAL_HOST_PORT);

const target = `${scheme}://${host}`;
const localHost = `http://localhost:${localPort}`;

const authLoginRegExp = new RegExp(
  `(\\\\)?/auth(\\\\)?/saml(\\\\)?/login`,
  "gi"
);

const replaceRegExp = new RegExp(`${scheme}:(\\\\)?/(\\\\)?/${host}`, "gi");

app.use(
  "/",
  createProxyMiddleware({
    /**
     * IMPORTANT: avoid res.end being called automatically
     **/
    selfHandleResponse: true, // res.end() will be called internally by responseInterceptor()

    target,
    changeOrigin: true,
    autoRewrite: true,
    headers: {
      host,
      origin: target,
    },
    proxyTimeout: 5 * 60 * 1000,
    onProxyReq(proxyReq, req) {
      const referer = proxyReq.getHeader("referer");

      console.log(`Proxies request: ${req.method} ${referer || ''}${req.url} -> ${proxyReq.method} ${proxyReq.protocol}//${proxyReq.host}${proxyReq.path}`);

      if (referer) {
        proxyReq.setHeader(
          "referer",
          (referer as string).replace(localHost, target)
        );
      }

      req.socket.on('close', () => {
        setTimeout(() => {
          if (!proxyReq.destroyed) {
            proxyReq.destroy();
          }
        }, 200);
      });

      return proxyReq;
    },
    onProxyRes: responseInterceptor(
      async (responseBuffer, proxyRes, req, res) => {
        const type = await fileTypeFromBuffer(responseBuffer);

        if (type) {
          return responseBuffer;
        } else {
          const response = responseBuffer.toString("utf8"); // convert buffer to string

          return response
            .replace(replaceRegExp, localHost)
            .replace(authLoginRegExp, "/login"); // manipulate response and return the result
        }
      }
    ),
  })
);

app.listen(localPort, () => {
  console.log(`Try to open ${localHost} in the browser`);

  open(localHost).catch(() => {
    //
  });
});
