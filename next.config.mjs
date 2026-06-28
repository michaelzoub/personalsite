/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'adhdcapital.xyz',
                pathname: '/**',
            },
            {
                protocol: 'https',
                hostname: 'caliga.xyz',
                pathname: '/**',
            },
        ],
    },
};

export default nextConfig;
