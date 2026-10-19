/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: false,
    async redirects() {
        return ['/writing', '/music', '/addpost'].map((source) => ({ source, destination: '/', permanent: true }));
    },
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
