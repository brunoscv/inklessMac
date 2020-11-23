import React, { useEffect, useState } from 'react';
import { PermissionsAndroid } from 'react-native';
import Routes from './src/routes';

export default function App() {

  const [hasFilePermission, setHasFilePermission] = useState(false);
  useEffect(() => {
    
    requestFilePermission = async () => {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          setHasFilePermission(true);
        } else {
          setHasFilePermission(false);
        }
      } catch (err) {
        console.warn(err);
      }
    };
    requestFilePermission();
  }, []);

  return <Routes />;
 
}