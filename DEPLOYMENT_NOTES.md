# ZeroCrafter Deployment Notes

## Node.js/Next.js Deployment

- Do NOT commit `node_modules` folders. Deployment platforms (Vercel, Netlify, Heroku, etc.) will run `npm install` automatically for both frontend and backend if `package.json` is present.
- If using a monorepo, configure your deployment platform to install dependencies in both `frontend` and `backend`.
- Ensure all dependencies are listed in the correct `package.json` files.
- For PDF generation in backend, we use `pdfkit` (pure Node.js, works on all platforms).
- For frontend, Next.js will be built automatically if `next build` is the build command.

## Environment Variables

- Set all secrets (MongoDB URI, JWT, API keys) in the deployment platform's environment variable settings. Do NOT hardcode secrets in code or commit them to the repo.

## Common Issues

- If you see `next: not found`, it means dependencies are not installed. This will not happen on deployment platforms if your `package.json` is correct.
- If you need to generate PDFs in the backend, the `/api/reports/pdf` endpoint now returns a real PDF file using `pdfkit`.

## PDF Generation

- The backend now uses `pdfkit` for PDF generation. No native binaries required, works on all Node.js hosts.

## Recommendations

- Test locally with `npm install` in both `frontend` and `backend` before pushing.
- Push only source code and config files, not build artifacts or `node_modules`.
- Use `.env.example` to document required environment variables.

---

For any deployment-specific configuration, refer to your platform's documentation (Vercel, Netlify, Heroku, etc.).
