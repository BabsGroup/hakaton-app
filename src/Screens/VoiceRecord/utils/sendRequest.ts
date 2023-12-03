import ReactNativeBlobUtil from 'react-native-blob-util';
import mime from 'mime';
import {Coords} from '../types';

const API_URL = 'http://82.97.241.218:5000';

export const sendRequest = (
  coords: Coords,
  fileUri: string,
): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    ReactNativeBlobUtil.config({
      fileCache: true,
    })
      .fetch(
        'POST',
        `${API_URL}/process`,
        {
          'Content-Type': 'multipart/form-data',
        },
        [
          {
            name: 'file',
            filename: 'file',
            type: mime.getType(fileUri),
            data: ReactNativeBlobUtil.wrap(fileUri),
          },
          {
            name: 'geo',
            data: JSON.stringify(coords),
          },
        ],
      )
      .then(async response => {
        const raw = await response.json();
        const url = `${API_URL}/process/${raw.id}`;
        resolve(url);
      })
      .catch(e => {
        console.log('send Request error')
        console.log(e);
        reject();
      });
  });
};
