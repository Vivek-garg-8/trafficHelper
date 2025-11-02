"use client"
import React from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

function AnimatedNumber({ value }) {
    const spring = useSpring(value, {
        damping: 20,
        stiffness: 300,
    });

    const displayValue = useTransform(spring, (latest) => Math.round(latest));

    React.useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{displayValue}</motion.span>;
}

function Sparkline({ data, width = 550, height = 400 }) {
    if (!data || data.length < 2) {
        return null;
    }

    // --- MODIFICATION: Use fixed scale (0-100) instead of dynamic scale ---
    const min = 0;
    const max = 100;
    const range = max - min; // 100
    // --- END MODIFICATION ---

    const pathData = data
        .map((d, i) => {
            const x = (i / (data.length - 1)) * width;
            
            const clampedValue = Math.max(min, Math.min(max, d));
            const y = height - ((clampedValue - min) / range) * height;
            // --- END MODIFICATION ---
            
            return `${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`;
        })
        .join(' ');

    const fillData = `${pathData} V ${height} L 0 ${height} Z`;

    return (
        <svg
            width="90%"
            height="100%"
            viewBox={`0 0 ${width} ${height}`}
            preserveAspectRatio="none"
            className='bg-gray-800 rounded-2xl mt-6 p-5'
        >
            <defs>
                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="50%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ef4444" />
                </linearGradient>
                <linearGradient id="fill-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={fillData} fill="url(#fill-gradient)" stroke="none" />
            <path
                d={pathData}
                fill="none"
                stroke="url(#line-gradient)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

export function TrafficDensityCard({ density, status, history }) {
    const statusColors = {
        Low: 'bg-green-500/10 text-green-400 border-green-500/20',
        Medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
        High: 'bg-red-500/10 text-red-400 border-red-500/20',
    };

    const colorClasses = statusColors[status] || statusColors['Medium'];

    return (
        <motion.div
            className="p-6 bg-slate-700 border border-gray-700 rounded-xl shadow-2xl text-white overflow-hidden w-full flex flex-col justify-around" 
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        >
            <div className="flex justify-between items-center mb-4 text-3xl">
                <h3 className="font-semibold text-gray-200">
                    Traffic Density
                </h3>
                <span
                    className={`px-3 py-1 text-2xl font-medium rounded-full border ${colorClasses}`}
                >
                    {status}
                </span>
            </div>
            <div className="flex flex-col items-center space-x-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-6xl font-bold tracking-tighter bg-clip-text text-gray-400">
                        <AnimatedNumber value={density} />
                    </span>
                    <span className="text-2xl font-medium text-gray-500">%</span>
                </div>
                <p className="text-sm text-gray-500 mt-4">Real-time congestion index</p>
            </div>
            <div className="shrink-0 flex flex-col items-center">
                <Sparkline data={history} />
            </div>
        </motion.div>
    );
}
