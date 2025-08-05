/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'res.cloudinary.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'raw.githubusercontent.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'images.samsung.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'fdn2.gsmarena.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'images.unsplash.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'images.pexels.com',
                pathname: '**',
            },
            {
                protocol: 'https',
                hostname: 'i02.appmifile.com',
                pathname: '**',
            },
            
        ],
    },
};

export default nextConfig;
