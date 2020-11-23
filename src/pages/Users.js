import React from 'react';
import { View, Text, StyleSheet, StatusBar, Image, TouchableOpacity } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faArrowLeft, faFileAlt, faUserCircle, faCheckCircle, faPhoneSquareAlt } from '@fortawesome/free-solid-svg-icons';
import { ScrollView } from 'react-native-gesture-handler';

// import { Container } from './styles';

export default function Users({ navigation }) {

    async function goToMenu() {
        //const response = await api.get()
        //await AsyncStorage.setItem('user', 30059);
        navigation.navigate('Menu');
    }

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" style={styles.statusBar}/>
            <View style={styles.actionsBlock}>
                
                <View style={styles.backBlock}>
                   <TouchableOpacity onPress={goToMenu} style={styles.navButton}>
                        <FontAwesomeIcon icon={ faArrowLeft } size={20} color="#fff"/>
                    </TouchableOpacity>
                    <View style={styles.rightBlock}>
                        <FontAwesomeIcon icon={ faUserCircle } size={25} color="#fff"/>
                    </View>
                </View>
                
            </View>

            <View style={styles.titleBlock}>
                <Text style={styles.nameBlock}>{"Laudos de,"}</Text>
                <Text style={styles.subnameBlock}>{"José Paciente Teste"}</Text>
            </View>

            <View style={{paddingVertical: 20, paddingHorizontal: 10}}>
                <Text>{"Todos Laudos"}</Text>
            </View>

            <ScrollView style={{
                flex: 1, 
                backgroundColor: "#cfd8dc", 
                borderTopLeftRadius: 30, 
                borderTopRightRadius: 30,
                paddingVertical: 2 }}>
                
                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>
                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >05/11/2020 às 8:00 PM</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >05/11/2020 às 8:00 PM</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >05/11/2020 às 8:00 PM</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >05/11/2020 às 8:00 PM</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >05/11/2020 às 8:00 PM</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >05/11/2020 às 8:00 PM</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >05/11/2020 às 8:00 PM</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >05/11/2020 às 8:00 PM</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>

                    <View style={{ 
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
                                <Text style={styles.cardName} >Dr. Maximo Henrique</Text>
                                <Text style={styles.cardTime} >05/11/2020 às 8:00 PM</Text>
                                <Text style={styles.cardTime} >1-receituário-16092720200829</Text>
                            </View>
                        </View>
                    </View>

                    
   

                    

                    
         
               
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#cfd8dc',
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
        padding: 16,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    rightBlock: {
        flexDirection: 'row',
    },
    titleBlock: {
        backgroundColor: '#1976d2',
        padding: 16,
        height: 130,
        position: "relative",
        borderBottomLeftRadius: 60,
        borderBottomRightRadius: 60
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