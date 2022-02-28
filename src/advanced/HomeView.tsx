import React from "react";
import MapView, { Polyline } from "react-native-maps";
import BackgroundGeolocation, {
	Location,
} from "react-native-background-geolocation";

const TSMapView = () => {
	const [coordinates, setCoordinates] = React.useState<any[]>([]);

	React.useEffect(() => {
		BackgroundGeolocation.onLocation(onLocation, (error) => {
			console.warn("[onLocation] ERROR: ", error);
		});

		BackgroundGeolocation.ready({
			debug: true,
			desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
			maxDaysToPersist: 2,
			stopOnTerminate: false,
			startOnBoot: true,
		}).then((state) => {
			if (!state.enabled) {
				BackgroundGeolocation.start();
			}
			BackgroundGeolocation.changePace(true);
		});

		return () => {
			setCoordinates([]);
			BackgroundGeolocation.removeAllListeners();
			BackgroundGeolocation.stop();
		};
	}, []);

	/// Add a location Marker to map.
	const onLocation = (location: Location) => {
		if (location.sample || !location.coords) return;
		setCoordinates((previous) => [
			...previous,
			{
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
			},
		]);
	};

	return (
		<MapView
			region={{
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
				coordinates={coordinates}
				geodesic={true}
				strokeColor="rgba(0,179,253, 0.6)"
				strokeWidth={6}
				zIndex={0}
			/>
		</MapView>
	);
};

export default TSMapView;
