import React, { useEffect, useState } from 'react';

function CircularProgress({ progress, icon, size = 'md', className = '' }) {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  // Size configurations
  const sizeConfig = {
    sm: { width: 120, height: 120, strokeWidth: 8, fontSize: 16 },
    md: { width: 160, height: 160, strokeWidth: 10, fontSize: 20 },
    lg: { width: 200, height: 200, strokeWidth: 12, fontSize: 24 }
  };

  const config = sizeConfig[size];
  const radius = (config.width - config.strokeWidth) / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference * (1 - animatedProgress / 100);

  // Animate progress on mount and when progress changes
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedProgress(progress);
    }, 100);

    return () => clearTimeout(timer);
  }, [progress]);

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative" style={{ width: config.width, height: config.height }}>
        {/* Background circle with markers */}
        <svg
          width={config.width}
          height={config.height}
          viewBox={`0 0 ${config.width} ${config.height}`}
          className="absolute inset-0"
        >
          {/* Background track */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={radius}
            stroke="#E5E7EB"
            strokeWidth={config.strokeWidth}
            fill="none"
          />
          
          {/* Progress circle */}
          <circle
            cx={config.width / 2}
            cy={config.height / 2}
            r={radius}
            stroke="#6266FF"
            strokeWidth={config.strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            transform={`rotate(-90 ${config.width / 2} ${config.height / 2})`}
            className="transition-all duration-1000 ease-out"
          />
          
          {/* Marker dots around the circle */}
          {Array.from({ length: 60 }).map((_, index) => {
            const angle = (index * 6 - 90) * (Math.PI / 180);
            const x = config.width / 2 + (radius - 5) * Math.cos(angle);
            const y = config.height / 2 + (radius - 5) * Math.sin(angle);
            
            return (
              <rect
                key={index}
                x={x - 1}
                y={y - 1}
                width="2"
                height="2"
                fill="#E5E7EB"
                rx="1"
              />
            );
          })}
        </svg>

        {/* Center icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div 
            className="text-3xl"
            style={{ fontSize: config.fontSize * 1.5 }}
          >
            {icon}
          </div>
        </div>
      </div>

      {/* Percentage text below */}
      <div 
        className="font-bold text-gray-900 mt-4"
        style={{ fontSize: config.fontSize }}
      >
        {Math.round(animatedProgress)}%
      </div>
    </div>
  );
}

export default CircularProgress;
