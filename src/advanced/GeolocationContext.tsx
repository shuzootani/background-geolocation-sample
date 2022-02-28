import React, { ReactNode, useEffect, useState, useRef } from "react";
import BackgroundGeolocation, {
	Location,
	LocationError,
	CurrentPositionRequest,
} from "react-native-background-geolocation";

interface Props {
	children: ReactNode;
}

interface Coordinates {
	latitude: number;
	longitude: number;
	timestamp: Date;
}

export type useGeoLocationReturnType = {
	locations: Coordinates[];
	lastLocation: null | {
		latitude: number;
		longitude: number;
	};
	changeMovingState: (willBeMoving: boolean) => void;
	clearLocations: () => Promise<void>;
	getCurrentLocation: (
		onSucceed: (location: Coordinates) => void,
		onFail?: (error: LocationError) => void,
		options?: CurrentPositionRequest
	) => void;
};

const LOCATION_AVAILABLE_STATES = [
	BackgroundGeolocation.AUTHORIZATION_STATUS_ALWAYS,
	BackgroundGeolocation.AUTHORIZATION_STATUS_WHEN_IN_USE,
];

export const GeolocationContext = React.createContext<useGeoLocationReturnType>(
	{
		locations: [],
		lastLocation: null,
		getCurrentLocation: () => void 0,
		changeMovingState: () => void 0,
		clearLocations: () => Promise.resolve(void 0),
	}
);

export default function GeolocationContextProvider({
	children,
}: Props): JSX.Element {
	const [locations, setLocations] = useState<Coordinates[]>([]);
	const lastLocationRef = useRef<useGeoLocationReturnType["lastLocation"]>(null);

	useEffect(() => {
		BackgroundGeolocation.getProviderState(({ status }) => {
			if (!LOCATION_AVAILABLE_STATES.includes(status)) {
				askLocationServicePermission();
			}
		});

		// https://transistorsoft.github.io/react-native-background-geolocation/interfaces/location.html
		BackgroundGeolocation.onLocation((location) => {
			if (location?.sample || !location.coords) return;
			const newLocation = {
				latitude: location.coords.latitude,
				longitude: location.coords.longitude,
				timestamp: new Date(location.timestamp),
			};
			setLocations((prevLocations) => prevLocations.concat(newLocation));
			lastLocationRef.current = newLocation;
		});

		// https://github.com/transistorsoft/react-native-background-geolocation/wiki/Philosophy-of-Operation
		// https://transistorsoft.github.io/react-native-background-geolocation/interfaces/config.html
		BackgroundGeolocation.ready(
			{
				maxDaysToPersist: 2,
				debug: true,
				persistMode: BackgroundGeolocation.PERSIST_MODE_NONE,
				desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_NAVIGATION,
				distanceFilter: 10,
				stationaryRadius: 25, // the plugin enforces 25 as minimum
				preventSuspend: true,
				logLevel: BackgroundGeolocation.LOG_LEVEL_OFF,
				startOnBoot: true,
				// notification: {
				// 	title: intl.formatMessage({
				// 		id: "useGeolocation.notification_banner_title",
				// 	}),
				// },
			},
			(state) => {
				// ⚠️ Do not execute any API method which will require accessing location-services
				// until #ready gets resolved (eg: #getCurrentPosition, #watchPosition, #start).
				if (!state.enabled) {
					BackgroundGeolocation.start();
				}

				BackgroundGeolocation.getLocations().then((_locations: any[]) => {
					const storedLocations: Coordinates[] = _locations.map(
						({ timestamp, coords }) => ({
							latitude: coords.latitude,
							longitude: coords.longitude,
							timestamp: new Date(timestamp),
						})
					);
					setLocations(storedLocations);
				});
			}
		);

		return (): void => {
			BackgroundGeolocation.removeAllListeners();
			BackgroundGeolocation.stop();
		};
	}, []);

	function getCurrentLocation(
		onSucceed: (location: Coordinates) => void,
		onFail?: (error: LocationError) => void,
		options?: CurrentPositionRequest
	): void {
		BackgroundGeolocation.getCurrentPosition({
			...options,
			samples: 1,
			persist: false,
		})
			.then((location: Location) => {
				const {
					timestamp,
					coords: { latitude, longitude },
				} = location;
				onSucceed({ latitude, longitude, timestamp: new Date(timestamp) });
			})
			.catch((error: LocationError) => {
				if (onFail) onFail(error);
			});
	}

	async function askLocationServicePermission(): Promise<void> {
		const status = await BackgroundGeolocation.requestPermission();
		if (LOCATION_AVAILABLE_STATES.includes(status)) {
			BackgroundGeolocation.start();
			return;
		}
	}

	async function clearLocations(): Promise<void> {
		setLocations([]);
		await BackgroundGeolocation.destroyLocations();
	}

	return (
		<GeolocationContext.Provider
			value={{
				locations,
				lastLocation: lastLocationRef.current,
				getCurrentLocation,
				changeMovingState: BackgroundGeolocation.changePace,
				clearLocations,
			}}
		>
			{children}
		</GeolocationContext.Provider>
	);
}
