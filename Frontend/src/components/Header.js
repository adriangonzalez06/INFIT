import React, { forwardRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../../views/stylesheet'
import Ionicons from 'react-native-vector-icons/Ionicons';

export const Header = forwardRef(({
    title = "",
    showBackButton = false,
    darkMode = false,
}, ref) => {

    const navigation = useNavigation();

    return (
        <View style={[styles.header, darkMode && styles.darkHeader]}>
            {showBackButton && (
                <TouchableOpacity
                    style={[styles.backButton, { top: Platform.OS === 'android' ? 48 : 23, left: 20 }]}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
                </TouchableOpacity>
            )}
            <Text style={[styles.headerTitle, darkMode && styles.darkText]}>{title}</Text>
        </View>
    );

});


export default Header;