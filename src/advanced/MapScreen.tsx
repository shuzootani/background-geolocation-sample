import React, { useContext, useState } from "react";
import { Button } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { GeolocationContext } from "./GeolocationContext";

const TSMapView = () => {
	const [isTracking, setIsTracking] = useState(false);
	const { locations, changeMovingState } = useContext(GeolocationContext);

	return (
		<MapView
			initialRegion={{
				latitude: 35.62832943167142,
				longitude: 139.66781306093526,
				latitudeDelta: 0.00922,
				longitudeDelta: 0.00421,
			}}
			showsUserLocation={true}
			style={{ flex: 1 }}
		>
			<Polyline
				key="polyline"
				coordinates={locations}
				geodesic={true}
				strokeColor="rgba(0,179,253, 0.6)"
				strokeWidth={6}
				zIndex={0}
			/>
			<Button
				title="START/STOP"
				onPress={() => {
					changeMovingState(!isTracking);
					setIsTracking((prev) => !prev);
				}}
			/>
		</MapView>
	);
};

export default TSMapView;
