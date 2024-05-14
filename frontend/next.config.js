/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
}

module.exports = nextConfig;

module.exports = {
    env: {
        API_URL: "http://localhost:4000"
    },
    images: {
        remotePatterns: [
            {
                hostname: 'localhost',
                port: '4000'
            }
        ]
    }
}
