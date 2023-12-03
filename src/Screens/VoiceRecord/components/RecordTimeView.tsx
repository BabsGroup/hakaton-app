import React from 'react';
import {Text} from 'react-native';

interface RecordTimeViewProps {
  time?: string;
}
export const RecordTimeView: React.FC<RecordTimeViewProps> = ({time}) => {
  if (!time) {
    return <Text>00:00:00</Text>;
  }

  return <Text>{time}</Text>;
};
