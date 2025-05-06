This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Casting Votes On-Chain

To enable the on-chain voting functionality, you need to set up the following environment variables in a `.env.local` file:

```bash
# Aztec Network Configuration
NEXT_PUBLIC_PXE_URL=http://localhost:8080
# You need to replace this with a valid private key from your Aztec wallet
NEXT_PUBLIC_AZTEC_PRIVATE_KEY=your_private_key_here
# Replace with your deployed contract address
NEXT_PUBLIC_CONTRACT_ADDRESS=your_contract_address_here
```

Make sure you:
1. Have the Aztec sandbox running locally at the specified PXE URL
2. Replace the placeholder private key with your actual Aztec wallet private key
3. Deploy the contract and update the contract address in the environment variables

## Notes
* Google uses Opaque tokens for the OAuth Access tokens, not JWT
* The id_token is passed upon initial sign in
* 106, 117, 97, 110, 98, 101, 108, 105, 101, 114, 97, 64, 103, 109, 97, 105, 108, 46, 99, 111, 109 is juanbliera@gmail.com

# TODO
* 