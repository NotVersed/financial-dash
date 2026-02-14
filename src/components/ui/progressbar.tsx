'use client';


interface CustomProgressBarProps {
  current: number;
  goal: number;
  label?: string;
  // TODO: why doesn't this work when I embed the color like ${color}-500 ??
  // color?: 'green' // consider adding more (valid) colors as options;
  showAnimation?: boolean;
}

export default function CustomProgressBar({
  current,
  goal,
  label,
  // color = 'green',
  showAnimation = true,
}: CustomProgressBarProps) {
  const percentage = Math.min((current / goal) * 100, 100);
  const isLowProgress = percentage <= 50;

  return (
    <div className="w-full">
      {label && <p className="text-sm font-medium text-gray-700 mb-2">{label}</p>}
      <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
        {/* Orange section (if progress <= 50%) */}
        {isLowProgress && (
          <div
            className={`absolute left-0 top-0 h-full bg-orange-500 ${
              showAnimation ? 'transition-all duration-500' : ''
            }`}
            style={{ width: `${percentage}%` }}
          />
        )}

        {/* Current progress bar (if progress > 50%) */}
        {!isLowProgress && (
          <div
            className={`absolute left-0 top-0 h-full bg-green-500 ${
              showAnimation ? 'transition-all duration-500' : ''
            }`}
            style={{ width: `${percentage}%` }}
          />
        )}


      </div>

      {/* Display current / goal */}
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm text-gray-600">
          {current} / {goal}
        </span>
        <span className="text-sm font-semibold text-gray-700">
          {Math.round(percentage)}%
        </span>
      </div>
    </div>
  );
}