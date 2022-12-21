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
