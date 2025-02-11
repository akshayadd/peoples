# Peoples
It's React application with Remix framework to list people with multiple emails, phone numbers and addresses. User can be created, updated, deleted and bulk deletable. Also deleted user can be restorable but dependent recoreds will be deleted.

## Development

Run the dev server:

```shellscript
npm install
npm run dev
```

## Deployment

To build your app for production:

```sh
npm run build
```

To run the app in production mode:

```sh
npm start
```

Now you'll need to pick a host to deploy it to.

### DIY

If you're familiar with deploying Node applications, the built-in Remix app server is production-ready.

Make sure to deploy the output of `npm run build`

- `build/server`
- `build/client`

## Styling

This template comes with [Tailwind CSS](https://tailwindcss.com/) already configured for a simple default starting experience. You can use whatever css framework you prefer. See the [Vite docs on css](https://vitejs.dev/guide/features.html#css) for more information.
