"use client"
import React, { useState, useEffect } from 'react'
import { TrafficDensityCard } from '@/Components/TrafficDensityCard'
import EmbeddedStimulation from '@/Components/EmbeddedStimulation'
import { TrafficLightTimerCard } from '@/Components/TrafficLightTimeCard'

const MIN_CYCLE_TIME = 30;
const MAX_CYCLE_TIME = 60;
const ORIGINAL_RATIOS = { green: 20 / 40, yellow: 5 / 40, red: 15 / 40 };

const generateGaussianNoise = () => {
  let u1 = 0, u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
};

const generateNewCycleConfig = () => {
  const mean = (MAX_CYCLE_TIME + MIN_CYCLE_TIME) / 2;
  const stdDev = (MAX_CYCLE_TIME - mean) / 5;
  const z = generateGaussianNoise();
  const newTotalTimeRaw = mean + z * stdDev;
  const newTotalTime = Math.round(Math.max(MIN_CYCLE_TIME, Math.min(MAX_CYCLE_TIME, newTotalTimeRaw)));

  const newGreen = Math.round(newTotalTime * ORIGINAL_RATIOS.green);
  const newYellow = Math.round(newTotalTime * ORIGINAL_RATIOS.yellow);
  const newRed = newTotalTime - newGreen - newYellow;

  const newLightCycle = [
    { light: 'Green', duration: newGreen },
    { light: 'Yellow', duration: newYellow },
    { light: 'Red', duration: newRed },
  ];

  const timeRange = MAX_CYCLE_TIME - MIN_CYCLE_TIME;
  const newDensity = Math.round(((newTotalTime - MIN_CYCLE_TIME) / timeRange) * 100);

  let newStatus = 'Medium';
  if (newDensity > 70) newStatus = 'High';
  else if (newDensity <= 30) newStatus = 'Low';

  return { newTotalTime, newLightCycle, newDensity, newStatus };
};

const initialState = generateNewCycleConfig();

const Page = () => {
  const [trafficData, setTrafficData] = useState({
    density: initialState.newDensity,
    status: initialState.newStatus,
    history: [0, 20, 40, 60, 80, 100, initialState.newDensity].slice(-20),
  });
  const [lightCycle, setLightCycle] = useState(initialState.newLightCycle);
  const [totalCycleTime, setTotalCycleTime] = useState(initialState.newTotalTime);
  const [cycleIndex, setCycleIndex] = useState(0);
  const [currentLightState, setCurrentLightState] = useState(initialState.newLightCycle[0]);
  const [timeRemaining, setTimeRemaining] = useState(initialState.newLightCycle[0].duration);

  // Timer update logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining(prevTime => {
        if (prevTime <= 1) {
          const nextIndex = (cycleIndex + 1) % lightCycle.length;
          if (nextIndex === 0) {
            const { newTotalTime, newLightCycle, newDensity, newStatus } = generateNewCycleConfig();
            setLightCycle(newLightCycle);
            setTotalCycleTime(newTotalTime);
            setTrafficData(prev => ({
              density: newDensity,
              status: newStatus,
              history: [...prev.history, newDensity].slice(-20),
            }));
            setCycleIndex(0);
            setCurrentLightState(newLightCycle[0]);
            return newLightCycle[0].duration;
          } else {
            const nextLight = lightCycle[nextIndex];
            setCycleIndex(nextIndex);
            setCurrentLightState(nextLight);
            return nextLight.duration;
          }
        }
        return prevTime - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cycleIndex, lightCycle]);

  // Sync status with backend
  useEffect(() => {
    const payload = {
      override: false,
      totalCycleTime,
      lightCycle: lightCycle.map(l => ({
        state: l.light || l.state || 'Unknown',
        duration: l.duration,
      })),
    };
    (async () => {
      try {
        const res = await fetch('/api/status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) console.error('Failed to update /api/status', await res.text());
      } catch (err) {
        console.error('Error posting /api/status', err);
      }
    })();
  }, [lightCycle]);

  // 🔘 Function to send override + direction data
  const sendOverride = async (direction) => {
    try {
      const payload = { override: true, direction }; // 0 = N–S, 1 = E–W
      const res = await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        console.log(`🚦 Override set: direction ${direction === 0 ? "North-South" : "East-West"}`);
      } else {
        console.error("Failed to update /api/control:", await res.text());
      }
    } catch (err) {
      console.error("Error calling /api/control", err);
    }
  };

  return (
    <div className='bg-black text-white h-[90vh] text-xl p-4 flex gap-10'>
      <section className='flex flex-col justify-between w-[50%] bg-gray-900 p-5 py-15 rounded-2xl'>
        <EmbeddedStimulation />
        <div className="flex flex-col items-center justify-center px-8 py-2 gap-10 w-full max-w-[92vw]">
          {/* North–South button */}
          <button
            onClick={() => sendOverride(0)}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-8xl font-medium text-gray-900 rounded-lg group bg-linear-to-br from-green-400 to-blue-600 hover:text-white dark:text-white"
          >
            <span className="relative px-5 py-2.5 transition-all bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent">
              North–South
            </span>
          </button>

          {/* East–West button */}
          <button
            onClick={() => sendOverride(1)}
            className="relative inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-8xl font-medium text-gray-900 rounded-lg group bg-linear-to-br from-green-400 to-blue-600 hover:text-white dark:text-white"
          >
            <span className="relative px-5 py-2.5 transition-all bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent">
              East–West
            </span>
          </button>
        </div>
      </section>

      <section className='flex flex-col justify-between gap-6 w-[50%] bg-gray-900 p-5 py-15 rounded-2xl'>
        <TrafficDensityCard
          density={trafficData.density}
          status={trafficData.status}
          history={trafficData.history}
        />
        <TrafficLightTimerCard
          currentLight={currentLightState.light}
          timeRemaining={timeRemaining}
          initialTime={currentLightState.duration}
          totalCycleTime={totalCycleTime}
        />
      </section>
    </div>
  );
};

export default Page;
