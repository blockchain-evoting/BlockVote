import { Clock } from "lucide-react";
import { useState, useEffect } from "react";

// Sample upcoming elections data
const upcomingElections = [
  {
    id: 1,
    title: "Presidential Election 2025",
    description: "National election to elect the next president",
    date: "2025-04-15",
  },
  {
    id: 2,
    title: "City Council Elections",
    description: "Local elections for city council representatives",
    date: "2025-05-10",
  },
  {
    id: 3,
    title: "Student Union Elections",
    description: "University-wide elections for student representatives",
    date: "2025-03-28",
  },
];

const TimeCountDown = () => {
  const [timeRemaining, setTimeRemaining] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const nextElectionDate = new Date(upcomingElections[0].date);
      const now = new Date();
      const difference = nextElectionDate.getTime() - now.getTime();

      if (difference > 0) {
        setTimeRemaining({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    const timer = setInterval(calculateTimeRemaining, 1000);
    calculateTimeRemaining();

    return () => clearInterval(timer);
  }, []);

  return (
    // Countdown Timer
    <div className="max-w-5xl mx-auto rounded-b-xl overflow-hidden">
      <div className="bg-white rounded-b-lg shadow-lg p-6">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-purple-600 mr-2" />
            <h2 className="text-sm md:text-xl font-semibold">
              Next Election: {upcomingElections[0].title}
            </h2>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <span className="text-3xl font-bold text-purple-600">
                {timeRemaining.days}
              </span>
              <p className="text-sm text-gray-600">Days</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-purple-600">
                {timeRemaining.hours}
              </span>
              <p className="text-sm text-gray-600">Hours</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-purple-600">
                {timeRemaining.minutes}
              </span>
              <p className="text-sm text-gray-600">Minutes</p>
            </div>
            <div className="text-center">
              <span className="text-3xl font-bold text-purple-600">
                {timeRemaining.seconds}
              </span>
              <p className="text-sm text-gray-600">Seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimeCountDown;
