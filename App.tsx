import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AdvancedApp from "./src/advanced/AdvancedApp";

const MainStack = createNativeStackNavigator();
const screenOptions = () => {
	return {
		headerShown: false,
	};
};

const App = () => {
	return (
		<NavigationContainer>
			<MainStack.Navigator
				initialRouteName="AdvancedApp"
				screenOptions={{
					headerStyle: {
						backgroundColor: "#fedd1e",
					},
				}}
			>
				<MainStack.Screen
					name="AdvancedApp"
					component={AdvancedApp}
					options={screenOptions}
				/>
			</MainStack.Navigator>
		</NavigationContainer>
	);
};

export default App;
