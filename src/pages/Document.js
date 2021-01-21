import React, { useEffect, useState } from 'react';

import { View, Text, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faFileAlt, faUserCircle, faDownload } from '@fortawesome/free-solid-svg-icons';
import { ScrollView } from 'react-native-gesture-handler';

import { format, parseISO } from "date-fns";

import AsyncStorage from '@react-native-async-storage/async-storage';

import api from '../services/api';
import messaging from '@react-native-firebase/messaging';
import RNFetchBlob from 'rn-fetch-blob';

export default function Document({ navigation }) {

    function goToMenu() {
       
    }

    /** FIREBASE NOTIFICATION NAVIGATOR */
  useEffect(() => {
    requestUserPermission();
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage.data));
      Alert.alert(
        remoteMessage.data.title,
        remoteMessage.data.body,
        [
          {text: 'OK', onPress: () => navigation.navigate(remoteMessage.data.screen)},
        ],
        {cancelable: false},
      );
    });
    messaging().onNotificationOpenedApp(remoteMessage => {
        console.log(
          'Notification caused app to open from background state:',
          remoteMessage.data,
        );
        navigation.navigate(remoteMessage.data.screen);
      });
      messaging().setBackgroundMessageHandler(async remoteMessage => {
        console.log(
          'Notification background:',
          remoteMessage.data,
        );
        navigation.navigate(remoteMessage.data.screen);
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
      console.log('Authorization status:', authStatus);
    }
  }

  getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
    if (fcmToken) {
     console.log(fcmToken);
     console.log("Your Firebase Token is:", fcmToken);
    } else {
     console.log("Failed", "No token received");
    }
  }
  /** FIREBASE NOTIFICATION NAVIGATOR */

  const requestFilePermission = async () => {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        console.log("You can use the camera");
      } else {
        console.log("Camera permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  };

  
  //const REMOTE_IMAGE_PATH = 'https://demo.inkless.digital/storage/img/152217202009085f57cbd9f3f45.jpeg';
  const downloadImage = (document) => {
    // Main function to download the image
    requestFilePermission();
    // To add the time suffix in filename
    let date = new Date();
    // Image URL which we want to download
    let image_URL = 'https://demo.inkless.digital/storage/'+ document;    
    // Getting the extention of the file
    let ext = getExtention(image_URL);
    ext = '.' + ext[0];
    // Get config and fs from RNFetchBlob
    // config: To pass the downloading related options
    // fs: Directory path where we want our image to download
    const { config, fs } = RNFetchBlob;
    let PictureDir = fs.dirs.PictureDir;
    let options = {
      fileCache: true,
      addAndroidDownloads: {
        // Related to the Android only
        useDownloadManager: true,
        notification: true,
        path:
          PictureDir +
          '/arquivo_' + 
          Math.floor(date.getTime() + date.getSeconds() / 2) +
          ext,
        description: 'Arquivo',
      },
    };
    config(options)
      .fetch('GET', image_URL)
      .then(res => {
        // Showing alert after successful downloading
        console.log('res -> ', JSON.stringify(res));
        Alert.alert(
            "",
            "Seu download foi realizado com sucesso!",
            [
              {text: 'OK'},
            ],
            {cancelable: false},
        );
      });
  };

  const getExtention = filename => {
    // To get the file extension
    return /[.]/.exec(filename) ?
             /[^.]+$/.exec(filename) : undefined;
  };

    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadDocuments() {
            const user_id = 30059;
            const response = await api.get('/inklessapp/clinicdoc/customer/' + user_id, { responseType: 'json' });
            //O response retorna como objeto no Inkless
            //É preciso dar um cast para array, como é feito abaixo.
            const arrResponse = []
            Object.keys(response.data).forEach(key => arrResponse.push(response.data[key]));
            //
            setDocuments(arrResponse);
            setLoading(!loading);
        }
        loadDocuments();
    }, []);

    const [username, setUsername] = useState('');
    useEffect(() => {
        async function loadName() {
            const user_id = await AsyncStorage.getItem('@storage_Key');
            const response = await api.get('/mobile/checkinid/' + user_id, { responseType: 'json' });
            setUsername(response.data.name);
        }
        loadName();
    }, []);
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" style={styles.statusBar}/>
            <View style={{backgroundColor: '#004ba0'}}>
                <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }>
                    <TouchableOpacity  onPress={() => navigation.navigate('Menu') } style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Documentos</Text></View>
                </View>
            </View>

            <ScrollView style={{
                flex: 1, 
                backgroundColor: "#ddd", 
                borderTopLeftRadius: 30, 
                borderTopRightRadius: 30 }}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.subnameBlock}>{username}</Text>
                    </View>
                    <View>
                        <Text style={{paddingHorizontal: 10, paddingVertical: 20}}>Todos os documentos</Text>
                    </View>
                     {!loading ?
                        documents.map(document => 
                            <View key={document.id} style={{ 
                                backgroundColor: '#fff', 
                                marginHorizontal: 10,
                                marginVertical: 4,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                borderRadius: 20 }}>
                                    
                                <View style={styles.cardBody} >
                                    <View style={{backgroundColor: '#1976d2', width: 60, height: 60, alignItems: 'center', justifyContent: 'center', borderRadius: 60}} >
                                        <FontAwesomeIcon icon={ faFileAlt } size={40} color="#fff"/>
                                    </View>
                                    <View style={styles.cardLeftSide} >
                                        <Text style={styles.cardHospital} >HOSPITAL GASTROVITA</Text>
                                        <Text style={styles.cardName} > Dr. { document.professional }</Text>
                                        <Text style={styles.cardTime} >{ format(parseISO(document.date_requisition), "dd/MM/yyyy ' às ' HH:mm") }</Text>
                                        <Text style={styles.cardTime} >Arquivo: { document.name }</Text>
                                    </View>
                                </View>
                                <View style={styles.cardFooter}>
                                    <TouchableOpacity onPress={ () => downloadImage(document.image) } style={styles.callButton}>
                                        <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center'}}>
                                            <FontAwesomeIcon icon={ faDownload } size={15} color="#fff"/>
                                            <Text style={styles.buttonText}>Baixar</Text>
                                        </View>
                                    </TouchableOpacity> 
                                </View>

                                
                                




                            </View>   
                        ) : <View style={{
                            flex: 1,
                            backgroundColor: '#fff', 
                            marginHorizontal: 10,
                            marginVertical: '30%',
                            paddingHorizontal: 14,
                            paddingVertical: 10,
                            borderRadius: 20,
                            alignItems: 'center', justifyContent: 'center'}}>
                            <ActivityIndicator size="large" color="#0000ff"/>
                            <Text style={{color: '#222', marginVertical: 10}}>Carregando ...</Text>
                        </View>
                    }  
               
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#ddd',
    },
    statusBar: {
        backgroundColor: '#1976d2',
        color: '#fff'
    },
    actionsBlock: {
        backgroundColor: '#1976d2',
    },
    backBlock: {
        backgroundColor: '#1976d2',
        padding: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rightBlock: {
        flexDirection: 'row',
    },
    titleBlock: {
        backgroundColor: '#004ba0',
        padding: 15,
        borderBottomLeftRadius: 15,
        borderBottomRightRadius: 15
    },
    nameBlock: {
        color: '#fff',
        fontSize: 16,
    },
    subnameBlock: {
        color: '#fff',
        fontSize: 13,
    },
    cardAvatar: {
        height: 60,
        width: 60,
        backgroundColor: 'gray',
        borderRadius: 60,
    },
    cardBody: {
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: {width:0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4
    },
    cardFooter: {
        flexDirection: 'row', 
        justifyContent:'center', 
        alignItems: 'center'
    },
    cardLeftSide: {
        paddingHorizontal: 10,
        flex: 1
    },  
    cardHospital: {
        color: '#1976d2',
        fontSize: 18,
        fontWeight: 'bold'
    },
    cardName: {
        color: '#222',
        fontSize: 14,
        fontWeight: 'bold'
    },
    cardTime: {
        color: '#222',
        fontSize: 14,
        fontWeight: 'bold',
        marginTop: 5
    },
    cardAddress: {
        color: 'gray',
        fontSize: 14,
        fontWeight: '500',
        marginTop: 5
    },
    iconMore: {
        position: 'absolute',
        bottom: 3,
        right: 0,
    },
    cardActionButtons: {

    },
    checkinButton: {
        backgroundColor: '#388e3c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 5,
        padding: 5,
        flexDirection: 'row'
    },
    callButton: {
        backgroundColor: '#388e3c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 5,
        padding: 5,
    },
    navButton: {

    },
    buttonText: {
        color:'#fff',
        fontWeight: 'bold',
        fontSize: 16,
        marginHorizontal: 10
    }
});