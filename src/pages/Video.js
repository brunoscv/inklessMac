import React, {useState, useEffect, useRef} from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';

import { OTSession, OTPublisher, OTSubscriber, OT } from 'opentok-react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faVideo, faMicrophone, faAngleLeft, faMicrophoneSlash, faVideoSlash, faPhoneSlash } from '@fortawesome/free-solid-svg-icons';

export default function Video({ navigation }) {
  
  const otSessionRef = useRef(OTSession);
  const apiKey = navigation.getParam('apiKey', 'Anonimo');
  const sessionId = navigation.getParam('sessionId', 'Anonimo');
  const tokenId = navigation.getParam('tokenId', 'Anonimo');
  const dimensions = {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  };
  const [videoCallConnected, setVideoCallConnected] = useState(false);
  const [mic, setMic] = useState(true);
  const [video, setVideo] = useState(true);
  const [loading, setLoading] = useState(true);

  const micHandler = () => {
    setMic(!mic)
    !mic ? console.log("Áudio ativado") : console.log("Áudio desativado");
  }
  const videoHandler = () => {
      setVideo(!video);
      !video ? console.log("Vídeo ativado") : console.log("Vídeo desativado");
  }

  const publisherProperties = {
    publishAudio: mic,
    publishVideo: video,
  };

  const sessionEventHandlers = {
    connectionCreated: (event) => {
      console.log('connection created', event);
      //subscriberViewHandler();
    },
    streamDestroyed: event => {
      console.log('Stream destroyeeeeeeeeeed!', event);
      navigation.navigate('Scheduling');
    },
    connectionDestroyed: (event) => {
      // subscriberViewHandler();
    },
    sessionConnected: (event) => {
      console.log('Session connected!', event);
      console.log(event.connection.connectionId);
    },
    sessionDisconnected: (event) => {
      console.log('sessionDisconnected', event);
      navigation.navigate('Scheduling');
    },
    sessionReconnected: (event) => {
      //subscriberViewHandler();
    },
    streamCreated: (event) => {
      console.log('Stream created!', event);
      subscriberViewHandler();
    },
    streamPropertyChanged: (event) => {
      console.log('Stream changed!', event);
    },
    signal: (event) => {
      console.log('Single', event.type);
    },
  };

  const subscriberEventHandlers = {
    connected: () => {
      console.log('[subscriberEventHandlers - connected]');
    },
    disconnected: () => {
      console.log('[subscriberEventHandlers - disconnected]');
    },
    error: error => {
      console.log('subscriberEventHandlers error:', error);
    },
  }

  const subscriberViewHandler = () => {
    setTimeout(() => {
        // setVideoCallConnected(true);
        setLoading(!loading);
    }, 3000);
  }

  const cancelHandler = () => {
    navigation.navigate('Scheduling');
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000'}}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <OTSession apiKey={apiKey} sessionId={sessionId} token={tokenId} eventHandlers={sessionEventHandlers} ref={otSessionRef}>
          <OTPublisher style={{ height: dimensions.height / 2, width: dimensions.width,  position: 'relative' }} properties={publisherProperties}/>
            {/* {videoCallConnected ? <OTPublisher style={styles.publisher} properties={publisherProperties}/> : null*/} 
            {loading ?  <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
                          <ActivityIndicator size="large" color="#0000ff" style={{alignItems: 'center', justifyContent: 'center'}}/>
                          <Text style={{color: '#fff', marginVertical: 10}}>Carregando chamada ...</Text>
                        </View> 
                    : 

                null

            }
          <OTSubscriber style={{ height: dimensions.height / 2, width: dimensions.width,  position: 'relative' }} eventHandlers={ subscriberEventHandlers}/>
        </OTSession>
      </View>

      <View style={styles.buttonView}> 
        <View style={{ marginHorizontal: 50 }}>
          <TouchableOpacity onPress={ cancelHandler } style={styles.cancelButton}>
            <FontAwesomeIcon icon={ faPhoneSlash } size={25} color="#fff"/>
          </TouchableOpacity>
        </View>

        <View style={{ marginHorizontal: 50 }}>
          <TouchableOpacity onPress={micHandler} style={styles.navButton}>
            {!mic ? <FontAwesomeIcon icon={ faMicrophoneSlash } size={30} color="#fff"/> : <FontAwesomeIcon icon={ faMicrophone } size={30} color="#fff"/>}
          </TouchableOpacity>
        </View>

        <View style={{ marginHorizontal: 50 }}>
          <TouchableOpacity onPress={videoHandler} style={styles.navButton}>
          {!video ? <FontAwesomeIcon icon={ faVideoSlash } size={30} color="#fff"/> : <FontAwesomeIcon icon={ faVideo } size={30} color="#fff"/>}
          </TouchableOpacity>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  publisher: {
    width: 100,
    height: 150,
    position: 'absolute',
    bottom: 50,
    right: 5,
    zIndex: 5,
  },
  buttonView: {
    height: 50,
    display: 'flex',
    width: '100%',
    position: 'relative',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  toolbarView: {
    height: 50,
    display: 'flex',
    width: '100%',
    position: 'relative',
    bottom: 0,
    left: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignContent: 'center',
  },
  cancelButton: {
    backgroundColor: 'red',
    color: `#fff`,
    padding: 10,
    borderRadius: 30,
    marginVertical: -10
  }
});