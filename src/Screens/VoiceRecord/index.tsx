import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import {useEffect, useState} from 'react';
import styled from 'styled-components';
import AudioRecorderPlayer from "react-native-audio-recorder-player/index";
import Sound from 'react-native-sound';
import Geolocation from '@react-native-community/geolocation';
import {useRequestGrants} from './utils/useRequestGrants';
import {RecordTimeView} from './components/RecordTimeView';
import {sendRequest} from './utils/sendRequest';
import {Coords} from './types';

const ScreenContainer = styled(View)`
  display: flex;
  align-items: center;
  justify-content: center;
  
  gap: 16px;

  width: 100%;
  height: 100%;
`;

type Disabled = {disabled: boolean};
const ButtonContainer = styled(View)<Disabled>`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 128px;
  height: 128px;

  background-color: ${(props) => props.disabled ? 'gray' : 'forestgreen'};

  border-radius: 64px;
  border-color: rgba(0, 0, 0, 0.5);
  border-width: 2px;
`;

const ButtonText = styled(Text)`
  font-size: 21px;
  text-align: center;

  color: white;
`;

const LoaderContainer = styled(View)`
  position: absolute;
  top: 48px;
  
  display: flex;
  gap: 10px;
  flex-direction: column;
`;

const StyledActivityIndicator = styled(ActivityIndicator)``;

const ScreenError: React.FC<{text: string}> = ({text}) => {
  return (
    <ScreenContainer>
      <Text>{text}</Text>
    </ScreenContainer>
  );
};

export const VoiceRecordScreen = () => {
  const hasGrants = useRequestGrants();
  const [audioPlayer, setAudioPlayer] = useState<
    AudioRecorderPlayer | undefined
  >();
  const [audio, setAudio] = useState<Sound | undefined>();
  const [isRecordingInProgress, setIsRecordingInProgress] = useState(false);
  const [isPlayingInProgress, setIsPlayingInProgress] = useState(false);
  const [isAudioDowloading, setIsAudioDownloading] = useState(false);
  const [recordTime, setRecordTime] = useState<string | undefined>();
  const [coords, setCoords] = useState<Coords | undefined>();
  const [forceGeoUpdateTries, setForceGeoUpdateTries] = useState(0);

  useEffect(() => {
    setAudioPlayer(new AudioRecorderPlayer());

    const watchId = Geolocation.watchPosition(
      result => {
        setCoords({
          latitude: result.coords.latitude,
          longitude: result.coords.longitude,
        });
      },
      console.log,
      {
        interval: 5,
      },
    );

    console.log(`Watch ID: ${watchId}`);

    return () => Geolocation.clearWatch(watchId);
  }, [forceGeoUpdateTries]);

  useEffect(() => {
    if (coords) {
      console.log(
        `Latitude: ${coords.latitude}, longitude: ${coords.longitude}`,
      );
    }
  }, [coords]);

  const onRecordStart = () => {
    setIsRecordingInProgress(true);

    const doAsync = async () => {
      await audioPlayer?.stopPlayer();
      await audioPlayer?.startRecorder();

      audioPlayer?.addRecordBackListener((e: any) => {
        setRecordTime(audioPlayer?.mmssss(Math.floor(e.currentPosition)));
      });
    };

    doAsync().catch(console.log);
  };

  const onRecordStop = () => {
    setIsRecordingInProgress(false);
    setIsPlayingInProgress(true);

    const doAsync = async () => {
      const uri = await audioPlayer?.stopRecorder();
      if (!uri || !coords) {
        console.log('no record uris or coords')
        return;
      }

      console.log('sending request..');
      const responseUri = await sendRequest(coords, uri);
      console.log(responseUri);

      setIsAudioDownloading(true);
      const audio = new Sound(responseUri, null, (error) => {
        if (!error) {
          audio.play(() => setIsPlayingInProgress(false));
          setIsAudioDownloading(false);
        }
      });

      setAudio(audio);
    };

    doAsync().catch(console.log);
  };

  if (!hasGrants) {
    return <ScreenError text={'У приложения нет нужных прав :('} />;
  }

  if (!coords) {
    return (
      <ScreenContainer>
        <Text>Ждем геопозицию...</Text>
        <TouchableOpacity onPress={() => {
          setForceGeoUpdateTries(forceGeoUpdateTries + 1);
        }}>
          <Text>Нажмите, чтобы обновить</Text>
        </TouchableOpacity>
      </ScreenContainer>
    );
  }

  if (!audioPlayer) {
    return (
      <ScreenError
        text={'Произошло что-то странное. Надо перезагрузить приложение'}
      />
    );
  }

  return (
    <ScreenContainer>
      {isAudioDowloading && (
        <LoaderContainer>
          <StyledActivityIndicator size={'large'} />
          <Text>Думаем над ответом...</Text>
        </LoaderContainer>
      )}

      {!isPlayingInProgress && (
        <TouchableOpacity
          disabled={isPlayingInProgress}
          onPress={isRecordingInProgress ? onRecordStop : onRecordStart}>
          <ButtonContainer disabled={isPlayingInProgress}>
            <ButtonText>
              {isRecordingInProgress ? 'Остановить запись' : 'Задать вопрос'}
            </ButtonText>
          </ButtonContainer>
        </TouchableOpacity>
      )}

      {isPlayingInProgress && (
        <TouchableOpacity
          onPress={() => {
            audio?.reset();
            setAudio(undefined);
            setIsPlayingInProgress(false);
          }}>
          <ButtonContainer disabled={isAudioDowloading}>
            <ButtonText>Стоп</ButtonText>
          </ButtonContainer>
        </TouchableOpacity>
      )}

      {isRecordingInProgress && (
        <RecordTimeView time={recordTime} />
      )}
    </ScreenContainer>
  );
};
