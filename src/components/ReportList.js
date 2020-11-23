import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';

import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';

// import { Container } from './styles';

export default function ReportList() {
    
    const [reports, setReports] = useState([]);
    useEffect(() => {
        async function loadReports() {
            const user_id = 30059;
            const response = await api.get('/checkinidall/' + user_id);
            
            setReports(response.data);
        }

        loadReports();
    }, []);
    
    return (
        
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
    );
}

const styles = StyleSheet.create({
    cardBody: {
        flexDirection: 'row',
        shadowColor: '#000',
        shadowOffset: {width:0, height: 2},
        shadowOpacity: 0.2,
        shadowRadius: 4
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
});