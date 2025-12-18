import React, { useState, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet
} from 'react-native';
import styles from '../../views/stylesheet'
import colors from '../../views/colors'


export const DayButton = forwardRef(({
    text = "",
    day = null
}, ref) => {

    return (
        <>
            <View style={styles.daysContainer}>
                <TouchableOpacity
                    style={[styles.dayButton, { backgroundColor: color }]}
                    onPress={() => {
                        setSelectedDay(day); setDishes(diet.getDishesForDay(day));
                        setColor(color == colors.light_gray ? colors.white : colors.light_gray);
                    }}>
                    <Text>{text}</Text></TouchableOpacity>
            </View>
        </>
    );
});