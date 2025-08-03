import { X, } from 'lucide-react';

export const MobileBlockerInstant: React.FC = () => {
    return (
        <div className="mobile-blocker-instant">
            <div className="relative max-w-lg mx-4 p-8 bg-white dark:bg-gray-800 rounded-xl shadow-2xl text-center border border-gray-200 dark:border-gray-700">
                <div className="mb-8">
                    <div className="mx-auto w-20 h-20 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
                        <X className="w-10 h-10 text-red-600 dark:text-red-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                        Mobile not supported, yet. :)
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                        We don't support mobile devices yet. Please access this site on a desktop or tablet with a screen width of at least 768px.
                    </p>
                </div>




            </div>
        </div>
    );
}; 