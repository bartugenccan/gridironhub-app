const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.gridiron-hub.net';

console.log('🔧 ENV Config - API URL:', API_URL);
console.log('🔧 ENV Config - Raw env value:', process.env.EXPO_PUBLIC_API_URL);

const ENV = {
  apiUrl: API_URL,
};

export default ENV;
