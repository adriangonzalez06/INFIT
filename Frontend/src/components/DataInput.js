import React from "react";
import { TextInput, View, Text } from 'react-native'
import stylesheet from "../../views/stylesheet.js"
import colors from "../../views/colors.js"
import styled from "styled-components/native"


export const InputField = styled.TextInput`
    margin-vertical: 8;
    padding-horizontal: 16;
    padding-vertical: 8;
    font-size: 14;
    border-width: 1;
    border-color: colors.gray;
    border-radius: 10;
    color: colors.dark_gray;
    background-color: colors.white;
    width: 250;
    align-self: 'center';
    `;

    const DataInput = ({ label, ...props}) => {
        return (
            <View>
                <Text>{label}</Text>
                <InputField {...props} />
            </View>
        )
    };

    export default DataInput;