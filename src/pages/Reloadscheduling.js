import React, { useEffect, useState } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, Image, TouchableOpacity, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faUserCircle, faCheckCircle, faPhoneSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { ScrollView } from 'react-native-gesture-handler';
import { HeaderBackButton } from '@react-navigation/stack';

import { format, parseISO } from "date-fns";
import Geolocation from 'react-native-geolocation-service';
import * as geolib from 'geolib';
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';

import api from '../services/api';
import axios from 'axios';
import baseURL from './Baseurl';
import logo from '../../assets/st.png';
// import { Container } from './styles';

import { BackHandler } from 'react-native';

export default function Reloadscheduling({ navigation }) {

    const [schedulings, setSchedulings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [hasLocationPermission, setHasLocationPermission] = useState(false);
    const [hasCheckin, setCheckin] = useState(false);
    const [alertLoading, setAlertLoading] = useState(false);
    const [callLoading, setCallLoading] = useState(false);
    const [connState, setConnState] = useState(0);
    const [response, setResponse] = useState([]);
    const [userId, setUserId] = useState('');
    const [user, setUser] = useState('');
    const [username, setUsername] = useState('');

    React.useLayoutEffect(() => {     
        navigation.setOptions({
            headerLeft: (...props) => (
                <HeaderBackButton {...props}           
                    onPress={() => {
                        navigation.navigate('Menu')
                    }}          
                    label=' Menu'           
                    tintColor='white'         
                    />       
            ),     
        });   
    }, [navigation]);

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

    useEffect(() => {
        async function loadCustomer() {
          const user_id = await AsyncStorage.getItem('@storage_Key');
          //const user_id = 30059;
          const response = await api.get('api/customer/' + user_id, { responseType: 'json' });
          setUser(response.data.data);
          setUserId(user_id);
          
        }
        loadCustomer();
    }, []);

    useEffect(() => {
        async function loadSchedulings() {
            const user_id = await AsyncStorage.getItem('@storage_Key');
            //const user_id = 30059;
            const response = await api.get('api/mobile/checkinid/' + user_id, { responseType: 'json' });
            //O response retorna como objeto no Inkless
            //É preciso dar um cast para array, como é feito abaixo.
            const arrResponse = []
            Object.keys(response.data.schedulings).forEach(key => arrResponse.push(response.data.schedulings[key]));
            setSchedulings(arrResponse);
            setLoading(!loading);
            setUsername(response.data.name);
        }
        loadSchedulings();
    }, []);

    async function verifyLocationPermission() {
        try {
            if(Platform.OS == 'ios') {
                Geolocation.requestAuthorization('whenInUse').then((res) => {
                    setHasLocationPermission(true);
                  });
            } else {
                const granted = await PermissionsAndroid.request(
                    PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
                );
                if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                    setHasLocationPermission(true);
                } else {
                    setHasLocationPermission(false);
                }
            }
        } catch (err) {
          console.warn(err);
        }
    }

    async function realizarCheckin(scheduling_id) {
        setAlertLoading(true);
        const response = await api.get('api/inklessapp/schedulingcheckin/' + scheduling_id, { responseType: 'json' });
        const message = JSON.stringify(response.data);
        if(response.status = 200) {
            setAlertLoading(false);
            Alert.alert("", response.data.message, [
                {
                    text: "CONFIRMAR",
                    onPress: () => navigation.navigate('Scheduling')
                }
            ]);
        } else {
            setAlertLoading(false);
            Alert.alert("Houve um erro", "Check-In não pôde ser realizado", [
                {
                    text: "CONFIRMAR",
                    onPress: () => navigation.navigate('Scheduling')
                }
            ]);
        } 
    }

    async function checkinConsulta(scheduling_id) {
        verifyLocationPermission();
        Geolocation.getCurrentPosition(
            ( position ) => {
                const dist = geolib.getDistance(position.coords, {
                    latitude: -5.091214,
                    longitude: -42.806561,
                });
                if(dist > 200) {
                    Alert.alert(
                        "CONFIRMAÇÃO",
                        "Você precisa estar próximo ao local da consulta para realizar o Check-In",
                        [
                          {text: 'CONFIRMAR'},
                        ],
                        {cancelable: false},
                      );
                }
                if(dist <= 200) {
                    realizarCheckin(scheduling_id);
                }
            },
            () => {
                Alert.alert(
                    "CONFIRMAÇÃO",
                    "Não foi possível obter sua localização. Por favor verique suas permissões e/ou conexão com Internet",
                    [
                      {text: 'CONFIRMAR'},
                    ],
                    {cancelable: false},
                  );
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        ); 
    }

    /** FIREBASE NOTIFICATION NAVIGATOR */
    useEffect(() => {
        requestUserPermission();
        const unsubscribe = messaging().onMessage(async remoteMessage => {
          //Alert.alert('A new FCM message arrived!', JSON.stringify(remoteMessage.data));
          setScheduling(JSON.stringify(remoteMessage.data.scheduling_id));
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
        });
        messaging().setBackgroundMessageHandler(async remoteMessage => {
          setScheduling(JSON.stringify(remoteMessage.data.scheduling_id));
          if(remoteMessage.data.scheduling_id) {
            navigation.navigate(remoteMessage.data.screen, {scheduling_id: remoteMessage.data.scheduling_id})
          }
          if( !remoteMessage.data.scheduling_id && remoteMessage.data.scheduling_id == null ) {
            navigation.navigate(remoteMessage.data.screen)
          }
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
    await messaging().getToken();
  }
  /** FIREBASE NOTIFICATION NAVIGATOR */

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" style={styles.statusBar}/>

            {/* Colocar essa view de volta no android <View style={{backgroundColor: '#004ba0'}}></View> <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }> */}
                <View style={ {backgroundColor: '#1976d2', padding: 10, flexDirection: 'row'} }>
                    <TouchableOpacity  onPress={() => navigation.navigate('Menu') } style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Check-In</Text></View>
                </View>
            <ScrollView style={{
                flex: 1, 
                backgroundColor: "#f5f5f5"}}>
                    <View style={styles.titleBlock}>
                        <Text style={styles.subnameBlock}>{user.name}</Text>
                    </View>
                    <View>
                        <Text style={{paddingHorizontal: 10, paddingVertical: 20}}>Todos os check-ins</Text>
                    </View>
                    {!loading ? 
                        schedulings.map(scheduling => 
                            <View key={scheduling.id} style={{ 
                                backgroundColor: '#fff', 
                                marginHorizontal: 10,
                                marginVertical: 4,
                                paddingHorizontal: 14,
                                paddingVertical: 10,
                                borderRadius: 20 }}>
                                <View style={styles.cardBody} >
                                <Image style={styles.cardAvatar} source={{uri: baseURL + 'storage/' + scheduling.professional_image}}/>
                                    <View style={styles.cardLeftSide} >
                                        <Text style={styles.cardName} >Dr(a). {scheduling.professional_name}</Text>
                                        <Text style={styles.cardTime} >{ format(parseISO(scheduling.date_scheduling), "dd/MM/yyyy") } às { scheduling.time_starting_booked }</Text>
                                        <Text style={styles.cardAddress} >{ scheduling.video_appointment == true ? <Text>Teleconsulta</Text> : <Text>Consulta Presencial</Text>} - Hospital Gastrovita</Text>
                                        <Text style={styles.cardAddress} >Não Atendido</Text>
                                    </View>
                                </View>
                                <View style={styles.cardFooter}>
                                    { scheduling.check_in == "Red"
                                        ?   <TouchableOpacity style={styles.dangerButton}>
                                                <FontAwesomeIcon icon={ faCheckCircle } size={20} color="#fff"/>
                                                <Text style={styles.buttonText}>Check-In Indisponível</Text>
                                            </TouchableOpacity>
                                        : (
                                            scheduling.check_in == "Green" ?   
                                            <TouchableOpacity style={styles.successButton}>
                                                <FontAwesomeIcon icon={ faCheckCircle } size={20} color="#fff"/>
                                                <Text style={styles.buttonText}>Check-In Feito</Text>
                                            </TouchableOpacity>
                                            :   (
                                                scheduling.video_appointment == true ? 
                                                <TouchableOpacity onPress={ () => realizarCheckin(scheduling.id) } style={styles.primaryButton}>
                                                    <FontAwesomeIcon icon={ faCheckCircle } size={20} color="#fff"/>
                                                    <Text style={styles.buttonText}>Fazer Check-In Teleconsulta</Text>
                                                </TouchableOpacity> 
                                                :
                                                <TouchableOpacity onPress={ () => checkinConsulta(scheduling.id) } style={styles.primaryButton}>
                                                    {alertLoading ? <ActivityIndicator size="small" color="#0000ff" style={{alignItems: 'center', justifyContent: 'center'}}/> : <FontAwesomeIcon icon={ faCheckCircle } size={20} color="#fff"/>}
                                                    <Text style={styles.buttonText}>Fazer Check-In</Text>
                                                </TouchableOpacity> 
                                            )
                                        )
                                    } 
                                    
                                    {
                                        scheduling.session_id && scheduling.session_token 
                                        ?  <TouchableOpacity onPress={ () => navigation.navigate('Video', { apiKey: `${scheduling.apiKey}`, sessionId: `${scheduling.session_id}`, tokenId: `${scheduling.session_token}` })} style={styles.callButton}>
                                                <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center'}}>
                                                    <FontAwesomeIcon icon={ faPhoneSquareAlt } size={20} color="#fff"/>
                                                    <Text style={styles.buttonText}>Atender Chamada</Text>
                                                </View>
                                            </TouchableOpacity> 
                                        : <Text></Text>
                                    }
                                    {/* <View>
                                        <TouchableOpacity  onPress={ () => handle(scheduling.id) } style={styles.successButton}>
                                        {callLoading ? <ActivityIndicator size="small" color="#0000ff" style={{alignItems: 'center', justifyContent: 'center'}}/> : <FontAwesomeIcon icon={ faCheckCircle } size={20} color="#fff"/>}
                                            <Text style={styles.buttonText}>Meet Call</Text>
                                        </TouchableOpacity>
                                    </View> */}
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
        </SafeAreaView>
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
        fontSize: 18,
        fontWeight: 'bold'
    },
    cardTime: {
        color: '#222',
        fontSize: 16,
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