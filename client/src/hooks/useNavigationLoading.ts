import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export function useNavigationLoading() {
  const [location] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [previousLocation, setPreviousLocation] = useState(location);

  useEffect(() => {
    if (location !== previousLocation) {
      setIsLoading(true);
      
      // Simulate brief loading state for better UX
      const timer = setTimeout(() => {
        setIsLoading(false);
        setPreviousLocation(location);
      }, 100);

      return () => clearTimeout(timer);
    }
  }, [location, previousLocation]);

  return isLoading;
}