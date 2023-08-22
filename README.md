# README

Welcome to [RedwoodJS](https://redwoodjs.com)!

> **Prerequisites**
>
> - Redwood requires [Node.js](https://nodejs.org/en/) (=18.x) and [Yarn](https://yarnpkg.com/) (>=1.15)
> - Are you on Windows? For best results, follow our [Windows development setup](https://redwoodjs.com/docs/how-to/windows-development-setup) guide

Start by installing dependencies:

```
yarn install
```

To run the project you must have an account in [Filestack](https://dev.filestack.com/signup/free) and get the APIKEY as in the image below ![Getting Filestack APIKEY ](https://user-images.githubusercontent.com/300/82616735-ec41a400-9b82-11ea-9566-f96089e35e52.png)

After that create a `.env` file in the root of the project and add the `REDWOOD_ENV_FILESTACK_API_KEY` as your APIKEY value.

Then start the development server:

```
yarn redwood dev
```

Your browser should automatically open to [http://localhost:8910](http://localhost:8910) where you'll see the Welcome Page, which links out to many great resources.
