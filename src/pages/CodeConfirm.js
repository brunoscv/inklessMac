import React, { useState, useEffect } from 'react';
import { Animated, SafeAreaView, View, Text, StyleSheet, StatusBar, TouchableOpacity, Image, ActivityIndicator, PermissionsAndroid, Alert } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faRocket } from '@fortawesome/free-solid-svg-icons';
import {
    CodeField,
    Cursor,
    useBlurOnFulfill,
    useClearByFocusCell,
  } from 'react-native-confirmation-code-field';

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from "@react-native-community/netinfo";
import { format, parseISO } from "date-fns";
import messaging from '@react-native-firebase/messaging';

import api from '../services/api';
import baseURL from './Baseurl';
import axios from 'axios';

import { ScrollView } from 'react-native-gesture-handler';

export default function CodeConfirm({ navigation }) {

    const user_id = navigation.getParam('user_id', '30059');

    const [connState, setConnState] = useState(0);
    const [response, setResponse] = useState([]);
    const [ loginUsers, setLoginUsers ] = useState();
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState('');
    const [user, setUser] = useState('');

    //	"verification_code": "719633",
    
    useEffect(() => {
        async function loadCustomer() {
          //const user_id = await AsyncStorage.getItem('@storage_Key');
          //const user_id = 30059;
          const response = await api.get('api/customer/' + user_id, { responseType: 'json' });
          if (response) setLoading(false);

          setUser(response.data.data);
          setUserId(user_id);
          
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

    const storeData = async (value) => {
        try {
            const varr = await AsyncStorage.setItem('@storage_Key', value);
        } catch (e) {
          // saving error
        }
    }
    
    async function verifyCode() {
        const response = await api.get('api/customer/'+ user_id, { responseType: 'json' });
        if (response.data['data'] > '0') {
            setLoading(true);
            console.log("code: " + response.data["data"]["verification_code"])
            if (connState.isConnected == true) {
                if (response.data["data"]["verification_code"] == value) {
                    
                    const fcmToken = await messaging().getToken();
                    const responseSec = await api.put('api/inklessapp/update/customer', { id: user_id, device_id: fcmToken, token_id: fcmToken });
                    
                    if (responseSec) {
                        storeData(JSON.stringify(user_id));
                        setLoading(false);
                        navigation.navigate('Menu', { user_id: user_id});
                    } else {
                        Alert.alert("Conexão", "Verifique os dados digitados e tente novamente!");
                    }   
                } else {
                    setLoading(false);
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

    const {Value, Text: AnimatedText} = Animated;

    const CELL_COUNT = 6;
    
    const animationsColor = [...new Array(CELL_COUNT)].map(() => new Value(0));
    const animationsScale = [...new Array(CELL_COUNT)].map(() => new Value(1));
    
    const [value, setValue] = useState('');
    const ref = useBlurOnFulfill({value, cellCount: 6});
    const [props, getCellOnLayoutHandler] = useClearByFocusCell({value,setValue});

    const renderCell = ({index, symbol, isFocused}) => {
    const hasValue = Boolean(symbol);
    const animatedCellStyle = {
        
    };
    // Run animation on next event loop tik
    // Because we need first return new style prop and then animate this value
    return (
        <AnimatedText
        key={index}
        style={[styles.cell, animatedCellStyle]}
        onLayout={getCellOnLayoutHandler(index)}>
        {symbol || (isFocused ? <Cursor /> : null)}
        </AnimatedText>
    );
    };

    const renderElements = () => {
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
                <View style={ {backgroundColor: '#fff', padding: 10, flexDirection: 'row'} }>
                    <Text style={{color: '#000', fontWeight: '600', fontSize: 18,}}>Digite o código recebido: </Text>
                </View>

                <View style={{backgroundColor: '#fff', padding: 30, flexDirection: 'row'}}>
                    <CodeField
                        ref={ref}
                        {...props}
                        value={value}
                        onChangeText={setValue}
                        cellCount={6}
                        rootStyle={styles.codeFieldRoot}
                        keyboardType="number-pad"
                        textContentType="oneTimeCode"
                        renderCell={renderCell}
                    />
                </View>
                
                <View style={{backgroundColor: '#fff', padding: 30, flexDirection: 'row'}}>
                    <TouchableOpacity onPress={ () => verifyCode() } style={styles.primaryButton}>
                        <View style={{flexDirection: 'row', justifyContent:'center', alignItems: 'center'}}>
                            <Text style={{color: '#fff', fontWeight: '600', fontSize: 18,}}>Enviar código</Text>
                        </View>
                    </TouchableOpacity>

                  
                </View>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" style={styles.statusBar}/>

            {/* Colocar essa view de volta no android <View style={{backgroundColor: '#004ba0'}}></View> <View style={ {backgroundColor: '#1976d2', padding: 10, borderBottomLeftRadius: 15, borderBottomRightRadius: 15, flexDirection: 'row'} }> */ }
                <View style={ {backgroundColor: '#1976d2', padding: 10, flexDirection: 'row'} }>
                    <TouchableOpacity  onPress={() => navigation.navigate('Menu') } style={{padding: 5}}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                
                    <View><Text style={{color: '#fff', fontSize: 20, fontWeight: '400'}}>Confirmar Código</Text></View>
                </View>

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
    codeFieldRoot: {
        height: 70,
        marginTop: 30,
        paddingHorizontal: 20,
        justifyContent: 'center',
      },
      cell: {
        marginHorizontal: 8,
        height: 40,
        width: 40,
        lineHeight: 35,
        ...Platform.select({web: {lineHeight: 65}}),
        fontSize: 30,
        textAlign: 'center',
        borderRadius: 8,
        color: '#3759b8',
        backgroundColor: '#fff',
    
        // IOS
        shadowColor: '#000',
        shadowOffset: {
          width: 0,
          height: 1,
        },
        shadowOpacity: 0.22,
        shadowRadius: 2.22,
    
        // Android
        elevation: 3,
      },
});