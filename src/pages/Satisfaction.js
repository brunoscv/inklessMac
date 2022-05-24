import React, { useEffect, useState } from 'react';
import { Alert, SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, ActivityIndicator, Modal } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faClock, faBookReader, faAngry, faMeh, faLaugh, faGrinHearts} from '@fortawesome/free-solid-svg-icons';
import { HeaderBackButton } from '@react-navigation/stack';

import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";

import api from '../services/api';
import axios from 'axios';
import baseURL from './Baseurl';

import { BackHandler } from 'react-native';


export default function Satisfaction({ route, navigation }) {

    const [notifications, setNotifications] = useState([]);
    const [notParse, setNotParse] = useState([]);
    const agendamento = route.params?.scheduling_id;
    const [callLoading, setCallLoading] = useState(false);
    const [connState, setConnState] = useState(0);
    const [response, setResponse] = useState([]);

    React.useLayoutEffect(() => {     
        navigation.setOptions({
            headerLeft: (...props) => (
                <HeaderBackButton {...props}           
                    onPress={() => {
                        navigation.reset({ index: 0, routes: [{ name: "Menu" }], })
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

    /** FIREBASE NOTIFICATION NAVIGATOR */
    useEffect(() => {
        requestUserPermission();
        function loadNotifications() {
            messaging().onNotificationOpenedApp(async remoteMessage => {
                setNotifications(JSON.stringify(remoteMessage.data));
            });
            messaging().onMessage(async remoteMessage => {
                setNotifications(JSON.stringify(remoteMessage.data));
            });
            messaging().setBackgroundMessageHandler(async remoteMessage => {
                setNotifications(JSON.stringify(remoteMessage.data));
            });
        }
        loadNotifications();
    }, []);

  requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      getFcmToken()
    }
  }

    getFcmToken = async () => {
        await messaging().getToken();
    }

    async function handle(rating, id) {
        setCallLoading(true);
        const data = {
            message_id: id,
            satisfaction: rating, 
        };

    
        const config = {
            method: "put",
            url: 'https://demo.denarius.digital/api/mobile/satisfaction/update',
            data: JSON.stringify(data),
            headers: { "content-type": "application/json" }
        };

        if (connState.isConnected == true) {
            const responsed = await axios(config);
            if( responsed.status == 200 ) {
            setResponse(responsed);
            setCallLoading(false);
            Alert.alert(
                "Confirmação",
                "A avaliação foi realizada com sucesso! Obrigado!",
                [
                {text: 'CONFIRMAR', onPress: () => navigation.reset({ index: 0, routes: [{ name: "Menu" }], })},
                ],
                {cancelable: false},
            );
            //Alert.alert("Contato", "A teleconsulta foi confirmada com sucesso! Clique no botão 'Atender Chamada' para iniciar o seu atendimento");
            } else {
            Alert.alert(
                "Conexão",
                "Verifique os dados digitados e tente novamente!",
                [
                {text: 'ENTENDIDO'},
                ],
            );
            }
        } else {
            setCallLoading(false);
            Alert.alert(
                "Conexão",
                "Detectamos que você não possui conexão ativa com a Internet. Por favor tente novamente!",
                [
                {text: 'ENTENDIDO'},
                ],
            );
        }
    }



  /** FIREBASE NOTIFICATION NAVIGATOR */
    const [attendances, setAttendances] = useState([]);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
    async function loadAttendances() {
        const user_id = await AsyncStorage.getItem('@storage_Key') || 30059;
        //const user_id = 30059;
        const response = await api.get('api/mobile/messageapps/satisfaction/search/' + user_id, { responseType: 'json' });
        //O response retorna como objeto no Inkless
        //É preciso dar um cast para array, como é feito abaixo.
        const arrResponse = []
        Object.keys(response.data.data).forEach(key => arrResponse.push(response.data.data[key]));
        //
        setAttendances(arrResponse);
        setLoading(!loading);
    }
    loadAttendances();
  }, []);
  const renderElements = (attendances) => {
    if(attendances == '' || attendances == null ) {
      return (
          
        <View style={{
          flex: 1,
          backgroundColor: '#004ba0', 
          marginHorizontal: 10,
          marginVertical: '30%',
          paddingHorizontal: 14,
          paddingVertical: 10,
          borderRadius: 20,
          alignItems: 'center', justifyContent: 'center'}}>
            <Text style={{fontSize: 22, color: '#fff'}}>Avaliação de Atendimento</Text>
            <Text style={{color: '#fff', marginVertical: 10, fontSize: 22, fontWeight: 'bold'}}>Não há avaliações disponíveis no momento. </Text>
        </View>
      );
    } else {
      return (
        attendances.map(attendance => 
          <View key={attendance.id} style={styles.content}> 
                <View style={{ paddingVertical: 5}}>
                    <Text style={{fontSize: 22, color: '#fff'}}>Avaliação de Atendimento</Text>
                </View>
                <View style={{paddingVertical: 5}}>
                    <Image style={{width: 200, height:200, borderRadius: 200 / 2}} source={{uri: baseURL + 'storage/' + attendance.image}}/>
                </View>
                <View style={{paddingHorizontal: 20}}>
                    <Text style={{fontSize: 16, color: '#fff', paddingVertical: 20}}>{attendance.body}</Text>
                </View>
                <View style={styles.firstrow}>
                    {!callLoading ? <TouchableOpacity onPress={ () => handle(0, attendance.id) } style={styles.button}>
                        <FontAwesomeIcon icon={ faAngry } size={20} color="#fff"/>
                        <Text style={styles.buttonText}>Odiei</Text>
                    </TouchableOpacity> : <ActivityIndicator size="small" color="#fff"/> }

                    {!callLoading ? <TouchableOpacity onPress={ () => handle(1, attendance.id) } style={styles.button}>
                        <FontAwesomeIcon icon={ faMeh } size={20} color="#fff"/>
                        <Text style={styles.buttonText}>Razoável</Text>
                    </TouchableOpacity> : <ActivityIndicator size="small" color="#fff"/> }

                    {!callLoading ? <TouchableOpacity onPress={ () => handle(2, attendance.id) } style={styles.button}>
                        <FontAwesomeIcon icon={ faLaugh } size={20} color="#fff"/>
                        <Text style={styles.buttonText}>Gostei</Text>
                    </TouchableOpacity> : <ActivityIndicator size="small" color="#fff"/> }

                    {!callLoading ? <TouchableOpacity onPress={ () => handle(3, attendance.id) } style={styles.button}>
                        <FontAwesomeIcon icon={ faGrinHearts } size={20} color="#fff"/>
                        <Text style={styles.buttonText}>Adorei</Text>
                    </TouchableOpacity> : <ActivityIndicator size="small" color="#fff"/> }

                </View>
          </View>   
        )
      )
    }
  }
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" style={styles.statusBar}/>

            <View style={ {backgroundColor: '#004ba0', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }>
                <TouchableOpacity  onPress={() => navigation.reset({ index: 0, routes: [{ name: "Menu" }], }) } style={{padding: 5}}>
                    <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                </TouchableOpacity>
            
                <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Avaliação de Atendimento</Text></View>
            </View>
           
            {!loading ?
                  renderElements(attendances)
                :
                  <View style={{
                    flex: 1,
                    backgroundColor: '#004ba0', 
                    marginHorizontal: 10,
                    marginVertical: '30%',
                    paddingHorizontal: 14,
                    paddingVertical: 10,
                    borderRadius: 20,
                    alignItems: 'center', justifyContent: 'center'}}>
                    <ActivityIndicator size="large" color="#fff"/>
                    <Text style={{color: '#fff', marginVertical: 10, fontSize: 15, fontWeight: 'bold'}}>Carregando ...</Text>
                  </View>
                  
                }
                
           
            
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#004ba0',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        fontSize: 30,
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
        color: '#fff',
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
        fontSize: 12,
        marginHorizontal: 10
    },
    firstrow: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#004ba0',
    },
    button: {
        height:80,
        width:80,
        backgroundColor: '#004ba0',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius:16,
        margin: 2,
        padding: 1
    }
});