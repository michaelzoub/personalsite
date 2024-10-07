/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['community.akamai.steamstatic.com', 'cryptologos.cc', 'upload.wikimedia.org', 'avatars.steamstatic.com'], // Add any other domains if needed
      },
      async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:8080/api/:path*', // Proxy to your backend
            },
        ];
    },
};

export default nextConfig;
