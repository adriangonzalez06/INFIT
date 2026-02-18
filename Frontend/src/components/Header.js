import React, { forwardRef } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import styles from '../../views/stylesheet'
import Ionicons from 'react-native-vector-icons/Ionicons';

export const Header = forwardRef(({
    title = "",
    showBackButton = false,
}, ref) => {
    const navigation = useNavigation();

    const renderBackButton = (showBackButton) => {
        if (showBackButton) {
            return (
                <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color="#ef2b2d" />
                </TouchableOpacity>
            );
        }
        return null;
    };

    return (
        <View style={styles.header}>
            {renderBackButton(showBackButton)}
            {/* title */}
            <Text style={styles.title}>{title}</Text>
        </View>
    );
});


export default Header;