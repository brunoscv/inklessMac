import React, { useState, useEffect } from 'react';
import { SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faEnvelope, faMagic, faMailBulk, faPaperPlane, faPlane, faRocket, faSave, faSms, faSubscript } from '@fortawesome/free-solid-svg-icons';

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { format, parseISO } from "date-fns";
import messaging from '@react-native-firebase/messaging';

import api from '../services/api';
import baseURL from './Baseurl';
import axios from 'axios';

import { ScrollView } from 'react-native-gesture-handler';
import { BackHandler } from 'react-native';

export default function CodeRequest({ route, navigation }) {

    const user_id = route.params?.user_id;

    const [connState, setConnState] = useState(0);
    const [loading, setLoading] = useState(true);
    const [response, setResponse] = useState([]);
    const [userId, setUserId] = useState('');
    const [user, setUser] = useState('');
    const [email, setEmail] = useState('');
    const [domain, setDomain] = useState('');
    const [phone1, setPhone1] = useState('');
    const [phone2, setPhone2] = useState('');

    useEffect(() => {
        BackHandler.addEventListener('hardwareBackPress', () => true);
        return () =>
          BackHandler.removeEventListener('hardwareBackPress', () => true);
      }, []);
    
    useEffect(() => {
        async function loadCustomer() {
          //const user_id = await AsyncStorage.getItem('@storage_Key');
          //const user_id = 30059;
          const response = await api.get('api/customer/' + user_id, { responseType: 'json' });
          if (response) setLoading(false);
          const str_email = response.data.data.email;
          const user_email = str_email.substring(str_email.split('@')[0], 3 ,2);
          const domain_email = str_email.substring(str_email.indexOf('@') - 0);

          const str_phone = response.data.data.cel;
          const user_phone1 = str_phone.substring(str_phone.indexOf('-') - 3, 0, 1);
          const user_phone2 = str_phone.substring(str_phone.indexOf('-') - 0, 12, 15)

          setUser(response.data.data);
          setUserId(user_id);
          setEmail(user_email);
          setDomain(domain_email);
          setPhone1(user_phone1);
          setPhone2(user_phone2);
          
        }
        loadCustomer();
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
    
    async function requestCode(user_id, type_message) {
        const response = await api.get('api/customer/'+ user_id, { responseType: 'json' });
        if (response.data['data'] > '0') {
            setLoading(true);
            if (connState.isConnected == true) {
                const responseSec = await api.post('api/mobile/customer/generate/pin', { customer_id: user_id, type_message: type_message, responseType: 'json' });
                if (responseSec) {
                    setResponse(responseSec);
                    setLoading(false);
                    // storeData(JSON.stringify(user_id));
                    navigation.navigate('CodeConfirm', { user_id: user_id});
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

    const source = {
        uri: 'https://user-images.githubusercontent.com/4661784/56352614-4631a680-61d8-11e9-880d-86ecb053413d.png',
    };

    const renderElements = () => {
        return (
            <View style={{
                flex: 1,
                backgroundColor: '#fff', 
                marginHorizontal: 1,
                marginVertical: 2,
                paddingHorizontal: 1,
                alignItems: 'center', justifyContent: 'center'}}>
                <View style={ {backgroundColor: '#fff', padding: 1, marginVertical:10, flexDirection: 'row'} }>
                    <Image style={styles.icon} source={source} />
                </View>
                <View style={ {backgroundColor: '#fff', padding: 2, marginVertical:10, marginHorizontal: 20, flexDirection: 'row'} }>
                    <Text style={{color: '#000', fontSize: 18, fontWeight: '400'}}>Enviaremos um Email ou SMS com um código de segurança.</Text>
                </View>
                <View style={ {backgroundColor: '#fff', padding: 2, marginVertical:10, flexDirection: 'row'} }>
                    <Text style={{color: '#000', fontSize: 18, fontWeight: '400'}}>Email cadastrado:</Text>
                </View>
                <View style={ {backgroundColor: '#f5f5f5', padding: 10, marginVertical:10, flexDirection: 'row'} }>
                    <Text style={{color: '#000', fontSize: 18, fontWeight: '400'}}>{email + "********" + domain} </Text>
                </View>
                <View style={ {backgroundColor: '#fff', padding: 2, marginVertical:10, flexDirection: 'row'} }>
                    <Text style={{color: '#000', fontSize: 18, fontWeight: '400'}}>Telefone cadastrado:</Text>
                </View>
                <View style={ {backgroundColor: '#f5f5f5', padding: 10, marginVertical:10, flexDirection: 'row'} }>
                    <Text style={{color: '#000', fontSize: 18, fontWeight: '400'}}>{phone1 + "***" + phone2 + "**"} </Text>
                </View>
                <View style={{backgroundColor: '#fff', padding: 2, flexDirection: 'row'}}>
                <TouchableOpacity onPress={ () => requestCode(user.id, 1) } style={styles.primaryButton}>
                    <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center'}}>
                    <FontAwesomeIcon icon={ faEnvelope } size={18} color="#fff"/><Text style={{color: '#fff', fontWeight: '600', fontSize: 18, padding:5}}>Enviar por Email</Text>
                    </View>
                </TouchableOpacity>

                <TouchableOpacity onPress={ () => requestCode(user.id, 2) } style={styles.primaryButton}>
                    <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center'}}>
                    <FontAwesomeIcon icon={ faPaperPlane } size={18} color="#fff"/><Text style={{color: '#fff', fontWeight: '600', fontSize: 18, padding:5}}>Enviar por SMS</Text>
                    </View>
                </TouchableOpacity>

                  
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" style={styles.statusBar}/>

            {/* Colocar essa view de volta no android <View style={{backgroundColor: '#004ba0'}}></View> <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }> 
                <View style={ {backgroundColor: '#1976d2', padding: 10, flexDirection: 'row'} }>
                    <TouchableOpacity  onPress={() => navigation.reset({ index: 0, routes: [{ name: "Menu" }], }) } style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Habilitar Código</Text></View>
                </View>
            */ }
                {!loading ?
                        renderElements()
                        :
                        <View style={{
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
        </SafeAreaView>
    );
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
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
        padding: 10,
        flexDirection: 'row'
    },
    navButton: {

    },
    buttonText: {
        color:'#fff',
        fontWeight: 'bold',
        fontSize: 14,
        marginHorizontal: 10
    },

    icon: {
        width: 240 / 2.4,
        height: 200 / 2.4,
        marginLeft: 'auto',
        marginRight: 'auto',
      },
});