import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAngleRight, faFileAlt, faArrowLeft, faDownload } from '@fortawesome/free-solid-svg-icons';
import Moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TextInputMask } from 'react-native-masked-text';
import NetInfo from "@react-native-community/netinfo";
import { format, parseISO } from "date-fns";

import api from '../services/api';
import baseURL from './Baseurl';
import axios from 'axios';

import { ScrollView } from 'react-native-gesture-handler';

// import { Container } from './styles';

export default function Users({ navigation }) {
    const [connState, setConnState] = useState(0);
    useEffect(() => {
        NetInfo.fetch().then(state => {
          setConnState(state);
        });
    
        const unsubscribe = NetInfo.addEventListener(state => {
          setConnState(state);
        });
    
        return () => {
          unsubscribe();
        };
    }, []);

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
                {text: 'FECHAR', onPress: () => navigation.navigate(remoteMessage.data.screen, {scheduling_id: remoteMessage.data.scheduling_id})},
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
                {text: 'FECHAR', onPress: () => navigation.navigate(remoteMessage.data.screen)},
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
      getFcmToken();
    }
  }

  getFcmToken = async () => {
    const fcmToken = await messaging().getToken();
  }
  /** FIREBASE NOTIFICATION NAVIGATOR */

    async function verifyLocationPermission() {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
          );
          if (granted === PermissionsAndroid.RESULTS.GRANTED) {
            setHasLocationPermission(true);
          } else {
            setHasLocationPermission(false);
          }
        } catch (err) {
          console.warn(err);
        }
    }

    const storeData = async (value) => {
        try {
            const varr = await AsyncStorage.setItem('@storage_Key', value);
        } catch (e) {
          // saving error
        }
    }

    getMyStringValue = async () => {
        try {
          const logged = await AsyncStorage.getItem('@storage_Key');
          if (logged) {
            navigation.navigate('Menu');
          }
        } catch(e) {}
    }

    const [response, setResponse] = useState([]);
    async function handleLogin(user_id) {
       
        const response = await api.get('api/customer/'+ user_id, { responseType: 'json' });
        console.log(response.data['data']);
        if (response.data['data'] > '0') {
           
            const fcmToken = await messaging().getToken();
            setLoading(true);
            if (connState.isConnected == true) {
            
                const responseSec = await api.put('api/inklessapp/update/customer', { id: user_id, device_id: fcmToken, token_id: fcmToken });
                
                if (responseSec) {
                    setResponse(responseSec);
                    setLoading(false);
                    storeData(JSON.stringify(user_id));
                    navigation.navigate('Menu');
                } else {
                    Alert.alert("Conexão", "Verifique os dados digitados e tente novamente!");
                }
            } else {
                setLoading(false);
                Alert.alert("Conexão", "Detectamos que você não possui conexão ativa com a Internet. Por favor tente novamente!");
            }

        } else {
            Alert.alert("Conexão", "Verifique os dados digitados e tente novamente!");
        }
    }

    const [ loginUsers, setLoginUsers ] = useState();
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        async function loadUsers() {
            const unmaskedCpf = navigation.getParam('cpf', 'Anonimo');
            const unmaskedNasc = navigation.getParam('birth', 'Anonimo');
            const response = await api.post('api/mobile/searchcpfbirth', { cpf: unmaskedCpf, birth: unmaskedNasc, responseType: 'json' });
            const arrResponse = []
            Object.keys(response.data.data).forEach(key => arrResponse.push(response.data.data[key]));
            setLoginUsers(arrResponse);
            setLoading(!loading);
            console.log(arrResponse);
        }
        loadUsers();
    }, []);

    const renderElements = (loginUsers) => {
        return (
            loginUsers.map(user => 
                <View key={user.id} style={{ 
                    backgroundColor: '#fff', 
                    marginHorizontal: 10,
                    marginVertical: 4,
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20 }}>
                        
                    <View style={styles.cardBody} >
                        {!user.image ? 
                            <Image style={styles.cardAvatar} source={require('../../assets/user.png')}/>
                            : 
                            <Image style={styles.cardAvatar} source={{uri: baseURL + 'storage/'+ user.image}}/> 
                        }
                        <View style={styles.cardLeftSide} >
                            <Text style={styles.cardName} >Nome: { user.name }</Text>
                            <Text style={styles.cardTime} >CPF: { user.cpf }</Text>
                            <Text style={styles.cardTime} >Data de Nasc.:{ format(parseISO(user.birth), "dd/MM/yyyy") }</Text>
                            <Text style={styles.cardHospital}>HOSPITAL GASTROVITA</Text>
                        </View>
                    </View>
                    <View style={styles.cardFooter}>
                        <TouchableOpacity onPress={ () => handleLogin(user.id) } style={styles.callButton}>
                            <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center'}}>
                                {/* <FontAwesomeIcon icon={ faDownload } size={15} color="#fff"/> */}
                                <Text style={styles.buttonText}>Entrar</Text>
                            </View>
                        </TouchableOpacity> 
                    </View>
                </View>   
            )
        )
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" style={styles.statusBar}/>

            <View style={{backgroundColor: '#004ba0'}}>
                <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }>
                    <TouchableOpacity  onPress={() => navigation.navigate('Menu') } style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Seus Usuários</Text></View>
                </View>
            </View>

            <ScrollView style={{
                flex: 1, 
                backgroundColor: "#f5f5f5", 
                borderTopLeftRadius: 30, 
                borderTopRightRadius: 30}}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.subnameBlock}>ESCOLHA UM USUÁRIO PARA ENTRAR</Text>
                    </View>
                    <View>
                        <Text style={{paddingHorizontal: 10, paddingVertical: 20}}>Todos os usuários</Text>
                    </View>
                    {!loading ?
                         renderElements(loginUsers) 
                        
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
        </View>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
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
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: 20
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
        fontSize: 15,
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
        backgroundColor: '#1976d2',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
    },
    callButton: {
        backgroundColor: '#388e3c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
    },
    dangerButton: {
        backgroundColor: '#d32f2f',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
        flexDirection: 'row'
    },
    successButton: {
        backgroundColor: '#388e3c',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
        flexDirection: 'row'
    },
    primaryButton: {
        backgroundColor: '#1976d2',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:4,
        margin: 2,
        padding: 4,
        flexDirection: 'row'
    },
    navButton: {

    },
    buttonText: {
        color:'#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginHorizontal: 10
    }
});