import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MapScreen from "./MapScreen";
import GeolocationContextProvider from "./GeolocationContext";

const Stack = createNativeStackNavigator();

const AdvancedApp = () => {
	return (
		<GeolocationContextProvider>
			<Stack.Navigator initialRouteName="MapScreen">
				<Stack.Screen name="MapScreen" component={MapScreen} />
			</Stack.Navigator>
		</GeolocationContextProvider>
	);
};

export default AdvancedApp;
