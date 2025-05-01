import { useEffect, useState } from 'react';
import axios from 'axios';

// Array of potential ports to check
const POTENTIAL_PORTS = [3001, 3000, 9000, 5000, 8080, 4321, 3456];

/**
 * ServerDiscovery component that automatically detects the API server port
 * and stores it in localStorage for use by the API service
 */
const ServerDiscovery: React.FC = () => {
  const [apiPort, setApiPort] = useState<number | null>(null);
  const [isDiscovering, setIsDiscovering] = useState(true);

  useEffect(() => {
    const discoverApiPort = async () => {
      setIsDiscovering(true);
      
      // Try to get the stored port from localStorage first
      const storedPort = localStorage.getItem('api_port');
      if (storedPort) {
        try {
          // Verify the stored port is still valid
          const response = await axios.get(`http://localhost:${storedPort}/api/health`, { timeout: 1000 });
          if (response.status === 200) {
            console.log(`✅ API server found on previously stored port: ${storedPort}`);
            setApiPort(parseInt(storedPort));
            setIsDiscovering(false);
            return;
          }
        } catch (error) {
          console.log(`❌ Stored API port ${storedPort} is no longer valid, discovering new port...`);
        }
      }

      // Try each potential port
      for (const port of POTENTIAL_PORTS) {
        try {
          console.log(`🔍 Checking for API server on port ${port}...`);
          const response = await axios.get(`http://localhost:${port}/api/health`, { timeout: 1000 });
          if (response.status === 200) {
            console.log(`✅ API server found on port: ${port}`);
            localStorage.setItem('api_port', port.toString());
            setApiPort(port);
            setIsDiscovering(false);
            return;
          }
        } catch (error) {
          console.log(`❌ API server not found on port ${port}`);
        }
      }

      console.error('❌ Could not find API server on any of the expected ports');
      setIsDiscovering(false);
    };

    discoverApiPort();
  }, []);

  // This component renders a hidden status indicator for debugging
  return (
    <div style={{ display: 'none' }} data-testid="server-discovery">
      <span data-status={isDiscovering ? 'discovering' : 'complete'}>
        {isDiscovering 
          ? 'Discovering API server...' 
          : apiPort 
            ? `API server found on port: ${apiPort}` 
            : 'API server not found'}
      </span>
    </div>
  );
};

export default ServerDiscovery;
