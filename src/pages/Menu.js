import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Image, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faClock, faBookReader, faFile, faFolder, faSignOutAlt, faVideo } from '@fortawesome/free-solid-svg-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';


export default function Menu({ navigation }) {
  const [scheduling, setScheduling] = useState(0);
  const [userId, setUserId] = useState('');
  
 
  /** FIREBASE NOTIFICATION NAVIGATOR */
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage.data));
      setScheduling(JSON.stringify(remoteMessage.data.scheduling_id));
      console.log(remoteMessage.data);
      if(remoteMessage.data.scheduling_id) {
        Alert.alert(
          remoteMessage.data.title,
          remoteMessage.data.body,
          [
            {text: 'OK', onPress: () => navigation.navigate(remoteMessage.data.screen, {scheduling_id: remoteMessage.data.scheduling_id})},
          ],
          {cancelable: false},
        );
        console.log(remoteMessage.data.scheduling_id);
      }
      if( !remoteMessage.data.scheduling_id && remoteMessage.data.scheduling_id == null ) {
        Alert.alert(
          remoteMessage.data.title,
          remoteMessage.data.body,
          [
            {text: 'OK', onPress: () => navigation.navigate(remoteMessage.data.screen)},
          ],
          {cancelable: false},
        );
        console.log(remoteMessage.data.scheduling_id);
      }
    });
    messaging().onNotificationOpenedApp(async remoteMessage => {
      setScheduling(JSON.stringify(remoteMessage.data.scheduling_id));
      if(remoteMessage.data.scheduling_id) {
        navigation.navigate(remoteMessage.data.screen, {scheduling_id: remoteMessage.data.scheduling_id})
      }
      if( !remoteMessage.data.scheduling_id && remoteMessage.data.scheduling_id == null ) {
        navigation.navigate(remoteMessage.data.screen)
      }
      console.log(remoteMessage.data.scheduling_id);
    });
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      setScheduling(JSON.stringify(remoteMessage.data.scheduling_id));
      if(remoteMessage.data.scheduling_id) {
        navigation.navigate(remoteMessage.data.screen, {scheduling_id: remoteMessage.data.scheduling_id})
      }
      if( !remoteMessage.data.scheduling_id && remoteMessage.data.scheduling_id == null ) {
        navigation.navigate(remoteMessage.data.screen)
      }
      console.log(remoteMessage.data.scheduling_id);
    });
    return unsubscribe;
   }, []);

  requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFcmToken()
      getMyStringValue()
      console.log('Authorization status:', authStatus);
    }
  }

  getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
    //  console.log(fcmToken);
     console.log("Your Firebase Token is:", fcmToken);
    } else {
     console.log("Failed", "No token received");
    }
  }

  getMyStringValue = async () => {
    try {
      const logged = await AsyncStorage.getItem('@storage_Key');
      if (logged == null || logged == "" || !logged) {
        navigation.navigate('Login');
      }
    } catch(e) {}
  }

  async function removeValue() {
    try {
      await AsyncStorage.removeItem('@storage_Key');
      navigation.navigate('Login');
    } catch(e) {}
  }

  /** FIREBASE NOTIFICATION NAVIGATOR */

  return (
      <View style={styles.container}>
      <View>
        <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row', justifyContent: 'space-between'} }>
          <Text style={styles.menuText}>Bem vindo(a)</Text>
          <Image style={styles.cardAvatar} source={{uri: 'https://demo.inkless.digital/storage/img/152013202009085f57cb5d778b8.png'}}/> 
        </View>
      </View>
      <View style={styles.content}>
        <View style={styles.firstrow}>
          <TouchableOpacity onPress={ () => navigation.navigate('Scheduling') } style={styles.button}>
            <FontAwesomeIcon icon={ faClock } size={80} color="#fff"/>
            <Text style={styles.buttonText}>Check-In</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={ () => navigation.navigate('Historic') } style={styles.button}>
            <FontAwesomeIcon icon={ faBookReader } size={80} color="#fff"/>
            <Text style={styles.buttonText}>Agendamentos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.secondrow}>
          <TouchableOpacity onPress={ () => navigation.navigate('Report') } style={styles.button}>
            <FontAwesomeIcon icon={ faFile } size={80} color="#fff"/>
            <Text style={styles.buttonText}>Laudos</Text>
          </TouchableOpacity>
          
          <TouchableOpacity onPress={ () => navigation.navigate('Document') } style={styles.button}>
            <FontAwesomeIcon icon={ faFolder } size={80} color="#fff"/>
            <Text style={styles.buttonText}>Documentos</Text>
          </TouchableOpacity>
        </View>
      </View>
      <View>
        <View style={ {flexDirection: 'row', justifyContent: 'flex-end', paddingHorizontal: 20} }>
          <Text style={styles.exitText}>Sair</Text>
          <View style={{paddingVertical: 12, paddingHorizontal: 5}}>
            <TouchableOpacity onPress={ () => removeValue() }>
              <FontAwesomeIcon icon={ faSignOutAlt } size={20} color="#fff"/>
            </TouchableOpacity> 
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1976d2',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  firstrow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976d2',

  },
  secondrow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976d2',

  },

  thridrow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1976d2',

  },
  button: {
    height:160,
    width:160,
    backgroundColor: '#29b6f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius:16,
    margin: 5
  },
  buttonText: {
    color:'#fff',
    fontWeight: 'bold',
    fontSize: 16
  },
  cardAvatar: {
    height: 50,
    width: 50,
    backgroundColor: 'gray',
    borderRadius: 50,
  },
  menuText: {
    color:'#fff',
    fontWeight: 'bold',
    fontSize: 18,
    paddingVertical: 10,
    paddingHorizontal: 10
  },
  exitText: {
    color:'#fff',
    fontSize: 18,
    paddingHorizontal: 5,
    paddingVertical: 10
  },
});