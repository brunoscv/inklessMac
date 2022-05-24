import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faAngleRight, faFileAlt, faArrowLeft, faDownload } from '@fortawesome/free-solid-svg-icons';
import { TextInputMask } from 'react-native-masked-text';

import Moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { format, parseISO } from "date-fns";
import messaging from '@react-native-firebase/messaging';


import api from '../services/api';
import baseURL from './Baseurl';
import axios from 'axios';
import { BackHandler } from 'react-native';

import { ScrollView } from 'react-native-gesture-handler';

// import { Container } from './styles';

export default function Users({ route, navigation }) {

    const [connState, setConnState] = useState(0);
    const [response, setResponse] = useState([]);
    const [ loginUsers, setLoginUsers ] = useState();
    const [loading, setLoading] = useState(true);
    
    useEffect(() => {
        async function loadUsers() {
            const unmaskedCpf = route.params?.cpf;
            const unmaskedNasc = route.params?.birth;
            const response = await api.post('api/mobile/searchcpfbirth', { cpf: unmaskedCpf, birth: unmaskedNasc, responseType: 'json' });
            const arrResponse = []
            Object.keys(response.data.data).forEach(key => arrResponse.push(response.data.data[key]));
            setLoginUsers(arrResponse);
            setLoading(!loading);
        }
        loadUsers();
    }, []);

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
           navigation.reset({ index: 0, routes: [{ name: "Menu" }], });
          }
        } catch(e) {}
    }

    async function handleLogin(user_id) {
       
        const response = await api.get('api/customer/'+ user_id, { responseType: 'json' });
        if (response.data['data'] > '0') {
            //const fcmToken = await messaging().getToken();
            //const fcmToken = "cWB4QZ3USeOvf4eyRXhEBO:APA91bHg_J6-ibH_0Jiebw4ZEArfZ2n3jU_Buk3k7seEXWWQ98ZbIbkHuT2hFOlfA7P0Jq41zRfpZqfDgiQBJNSvlzea5T9MiIJpyENbQM7qEcyw_G7W3Bq8oG0NcJjQNmtRMVZLIVLO";
            setLoading(true);
            if (connState.isConnected == true) { 
                //const responseSec = await api.put('api/inklessapp/update/customer', { id: user_id, device_id: fcmToken, token_id: fcmToken });
                setLoading(false);
                // storeData(JSON.stringify(user_id));
                navigation.navigate('CodeRequest', { user_id: user_id});
               
            } else {
                setLoading(false);
                Alert.alert("Conexão", "Detectamos que você não possui conexão ativa com a Internet. Por favor tente novamente!");
            }

        } else {
            Alert.alert("Conexão", "Verifique os dados digitados e tente novamente!");
        }
    }

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
                            <Text style={styles.cardTime} >CPF: { user.cpf.replace(/(\d{ 3 })(\d{ 3 })(\d{ 3 })(\d{ 2 })/, "$1.$2.$3-$4") }</Text>
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
        <SafeAreaView style={styles.container}>
            {/*<StatusBar barStyle="dark-content" style={styles.statusBar}/>*/}

            {/* Colocar essa view de volta no android <View style={{backgroundColor: '#004ba0'}}></View> <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }>
                <View style={ {backgroundColor: '#1976d2', padding: 10, flexDirection: 'row'} }>
                    <TouchableOpacity  onPress={() =>navigation.reset({ index: 0, routes: [{ name: "Menu" }], }) } style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Seus Usuários</Text></View>
                </View>
            */ }
            <ScrollView style={{
                flex: 1, 
                backgroundColor: "#f5f5f5"}}>
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