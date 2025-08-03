export const getPublicUrl = (): string => {
    const nodeEnv = process.env.NODE_ENV;

    switch (nodeEnv) {
        case 'development':
            return 'http://localhost:3000';
        case 'production':
            return 'https://builddrr.com';
        default:
            return process.env.NEXT_PUBLIC_URL || 'http://localhost:3000';
    }
}; 