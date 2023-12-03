import {useEffect, useState} from 'react';
import {PermissionsAndroid} from 'react-native';

export const useRequestGrants = () => {
  const [isGranted, setIsGranted] = useState(false);

  useEffect(() => {
    PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
    ])
      .then(async () => {
        const received = (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE))
          && (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE))
          && (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO))
          && (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION))
          && (await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION));

        setIsGranted(received);
      })
      .catch(() => {
        setIsGranted(false);
      });
  }, []);

  return isGranted;
};
