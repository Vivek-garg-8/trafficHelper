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

export function TrafficLightTimerCard({ 
  currentLight,     // "Green", "Yellow", or "Red"
  timeRemaining,    // Current seconds left (e.g., 12)
  initialTime,      // Initial time for this light (e.g., 15)
  totalCycleTime    // Total time for one full cycle
}) {
    
    // 1. Define colors for each light state
    const statusConfig = {
        Green: {
            badge: 'bg-green-500/10 text-green-400 border-green-500/20',
            progress: 'text-green-500',
        },
        Yellow: {
            badge: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            progress: 'text-yellow-500',
        },
        Red: {
            badge: 'bg-red-500/10 text-red-400 border-red-500/20',
            progress: 'text-red-500',
        },
    };

    const config = statusConfig[currentLight] || statusConfig['Red'];

    const size = 280;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = initialTime > 0 ? timeRemaining / initialTime : 0;
    
    // Create a spring for the progress
    const progressSpring = useSpring(progress, {
        damping: 20,
        stiffness: 300,
    });

    // Transform spring value into the SVG stroke offset
    const strokeDashoffset = useTransform(
        progressSpring,
        (val) => (1 - val) * circumference
    );

    // Update the spring when timeRemaining changes
    React.useEffect(() => {
        progressSpring.set(progress);
    }, [progressSpring, progress]);

    return (
        <motion.div
            className="p-6 py-14 bg-gray-900 border border-gray-700 rounded-xl shadow-2xl text-white overflow-hidden min-w-[45vw] min-h-[45vw] flex flex-col justify-between"
            whileHover={{ scale: 1.03 }}
            transition={{ type: 'spring', stiffness: 300, damping: 10 }}
        >
            {/* Header */}
            <div className="flex justify-between items-center mb-4 text-3xl">
                <h3 className="font-semibold text-gray-200">
                    Light Status
                </h3>
                <span
                    className={`px-3 py-1 text-2xl font-medium rounded-full border ${config.badge}`}
                >
                    {currentLight}
                </span>
            </div>

            {/* Main Display: Circular Progress and Countdown */}
            <div className="relative flex flex-col items-center justify-center">
                <svg width={size} height={size} className="transform -rotate-90">
                    {/* Background "track" circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        className="text-gray-700"
                        fill="transparent"
                        stroke="currentColor"
                    />
                    {/* Animated "progress" circle */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        strokeWidth={strokeWidth}
                        className={config.progress}
                        fill="transparent"
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        style={{ strokeDashoffset }}
                    />
                </svg>

                {/* Countdown Number (positioned in the center) */}
                <div className="absolute flex flex-col items-center">
                    <span className="text-8xl font-bold tracking-tighter bg-clip-text text-gray-400">
                        <AnimatedNumber value={timeRemaining} />
                    </span>
                    <span className="text-lg font-medium text-gray-500 -mt-2">
                        seconds
                    </span>
                </div>
            </div>

            {/* Footer: Total Cycle Time */}
            <div className="text-center mt-6">
                <p className="text-sm text-gray-500 uppercase tracking-wider">
                    Total Cycle Time
                </p>
                <p className="text-3xl font-semibold text-gray-200 mt-1">
                    {totalCycleTime}s
                </p>
            </div>
        </motion.div>
    );
}