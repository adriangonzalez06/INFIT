import style from '../../views/stylesheet'
import { View, Text } from 'react-native';

export const RenderLabels = ({ dish }) => {
    return (
        <>

            {/*etiquetas de vegetariano, vegano y sin gluten*/}
            <View style={{ flexDirection: 'row', gap: 5, marginTop: 3 }}>
                {dish.vegetarian && <Text style={[style.label, style.labelVegetarian]}>Vegetariano</Text>}
                {dish.vegan && <Text style={[style.label, style.labelVegan]}>Vegano</Text>}
                {dish.gluten_free && <Text style={[style.label, style.labelGlutenFree]}>Sin Gluten</Text>}
            </View>

        </>
    );
}

export default RenderLabels;