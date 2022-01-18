import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Alert, Platform } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faFileAlt, faDownload } from '@fortawesome/free-solid-svg-icons';
import { ScrollView } from 'react-native-gesture-handler';

import { format, parseISO } from "date-fns";
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFetchBlob from 'rn-fetch-blob';
import messaging from '@react-native-firebase/messaging';

import api from '../services/api';

export default function Document({ navigation }) {
    
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState('');

    useEffect(() => {
        async function loadCustomer() {
          const user_id = await AsyncStorage.getItem('@storage_Key');
          //const user_id = 30059;
          const response = await api.get('api/customer/' + user_id, { responseType: 'json' });
          setUser(response.data.data);
          
        }
        loadCustomer();
      }, []);

    useEffect(() => {
      async function requestFilePermission() {
        try {
          if(Platform.OS == 'ios') {
            console.log("IOs");
          } else {
            const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
            {
              title: "Storage Permission",
              message: "App needs access to memory to download the file "
            }
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
              console.log("Permitido");
            } else {
              console.log("Não Permitido");
            }
          } 
        } catch (err) {
          console.warn(err);
        }
      }
      requestFilePermission();
    }, []);

    useEffect(() => {
        async function loadDocuments() {
            const user_id = await AsyncStorage.getItem('@storage_Key');
            //const user_id = 30059;
            const response = await api.get('api/inklessapp/clinicdoc/customer/' + user_id, { responseType: 'json' });
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

    const downloadImage = (document) => {
        const file_URL = 'https://demo.denarius.digital/storage/'+ document;
        const encodedURI = encodeURI(file_URL); 
        const { config, fs } = RNFetchBlob;
        console.log(file_URL);
        //let PictureDir = fs.dirs.PictureDir;
        const DocumentDir = Platform.OS == 'ios' ? fs.dirs.DocumentDir : fs.dirs.DownloadDir
        const configfb = {
          fileCache: true,
          useDownloadManager: true,
          notification: true,
          mediaScannable: true,
          title: `${document}`,
          path: `${DocumentDir}/${document}`,
          description: 'Arquivo',
          
        }
        const configOptions = Platform.select({
          ios: {
              fileCache: configfb.fileCache,
              title: configfb.title,
              path: configfb.path,
              appendExt: 'pdf',
          },
          android: configfb,
      });
        config(configOptions)
        .fetch('GET', encodedURI)
        .then(res => {
        console.log('res -> ', JSON.stringify(res));
        if (Platform.OS === "ios") {
          RNFetchBlob.fs.writeFile(configfb.path, res.data, 'base64');
          RNFetchBlob.ios.previewDocument(configfb.path);
        }
        Alert.alert(
            "CONFIRMAÇÃO",
            "Seu download foi realizado com sucesso!",
            [
            {text: 'VER ARQUIVO'},
            ],
            {cancelable: false},
        );
        });
    };

    const renderElements = (documents) => {
      if(documents[0] == '400') {
        return (
          <View style={{
            flex: 1,
            backgroundColor: '#fff', 
            marginHorizontal: 10,
            marginVertical: '30%',
            paddingHorizontal: 14,
            paddingVertical: 10,
            borderRadius: 20,
            alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{color: '#222', marginVertical: 10}}>{documents[1]}</Text>
          </View>
        );
      } else {
        return (
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
          )
        )
      }
    }

    /** FIREBASE NOTIFICATION NAVIGATOR */
    useEffect(() => {
        requestUserPermission();
        const unsubscribe = messaging().onMessage(async remoteMessage => {
          //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage.data));
          setScheduling(JSON.stringify(remoteMessage.data.scheduling_id));
          console.log(remoteMessage.data);
          if(remoteMessage.data.screen == "Attendance" || remoteMessage.data.screen == "Clinic") {
            //Quando a notificação é para o atendimento em guiche e no consultorio, o aplicativo busca o id do customer para fazer 
            //a impressao das informações na tela do usuário.
            //Qualquer outras funcionalidades utilizam o id do agendamento para alimentar as rotas
            Alert.alert(
              remoteMessage.data.title,
              remoteMessage.data.body,
              [
                {text: 'CONFIRMAR', onPress: () => navigation.navigate(remoteMessage.data.screen, {scheduling_id: userId})},
              ],
              {cancelable: false},
            );
            console.log(remoteMessage.data.screen);
          } else {
            if(remoteMessage.data.scheduling_id) {
              Alert.alert(
                remoteMessage.data.title,
                remoteMessage.data.body,
                [
                  {text: 'CONFIRMAR', onPress: () => navigation.navigate(remoteMessage.data.screen, {scheduling_id: remoteMessage.data.scheduling_id})},
                ],
                {cancelable: false},
              );
              //console.log(remoteMessage.data.scheduling_id);
            }
            if( !remoteMessage.data.scheduling_id && remoteMessage.data.scheduling_id == null ) {
              Alert.alert(
                remoteMessage.data.title,
                remoteMessage.data.body,
                [
                  {text: 'CONFIRMAR', onPress: () => navigation.navigate(remoteMessage.data.screen)},
                ],
                {cancelable: false},
              );
              //console.log(remoteMessage.data.scheduling_id);
            }
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
      getFcmToken();
    }
  }

  getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
  }
  /** FIREBASE NOTIFICATION NAVIGATOR */

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" style={styles.statusBar}/>

            {/* Colocar essa view de volta no android <View style={{backgroundColor: '#004ba0'}}></View> <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }> */ }
                <View style={ {backgroundColor: '#1976d2', padding: 10, flexDirection: 'row'} }>
                    <TouchableOpacity  onPress={() => navigation.navigate('Menu') } style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Documentos</Text></View>
                </View>

            <ScrollView style={{
                flex: 1, 
                backgroundColor: "#f5f5f5" }}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.subnameBlock}>{user.name}</Text>
                    </View>
                    <View>
                        <Text style={{paddingHorizontal: 10, paddingVertical: 20}}>Todos os documentos</Text>
                    </View>
                     {!loading ?
                          renderElements(documents)
                         : <View style={{
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
        </SafeAreaView>
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
        backgroundColor: '#1976d2',
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