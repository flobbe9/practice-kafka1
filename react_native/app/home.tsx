import Br from "@/components/Br";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { defaultEquals, defaultEqualsFalsy } from "@/utils/utils";
import * as Location from 'expo-location';
import { useEffect, useState } from "react";
import { Button } from "react-native";
import { catchApiException, Producer, ProducerResponseFormat, RedpandaConfig } from 'redpanda';

const redpandaConfig: RedpandaConfig = {
    baseUrl: "http://192.168.2.104:8093", // proxy without auth
}

export default function Home() {
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [producer, ] = useState(new Producer("test", redpandaConfig));

    const locationFetchInterval = 1000;
  
    // fetch location
    useEffect(() => {
        // const interval = setInterval(async () => {
        //     updateCurrentLocation();
        // }, locationFetchInterval);

        // return () => {
        //     clearInterval(interval);
        // }
    }, []);

    async function updateCurrentLocation(): Promise<void> {
        try {
            const location = await getCurrentLocation();
            setLocation((currentLocation) => {
                // produce if location has changed
                async function produceAsync() {
                    if (!locationEquals(currentLocation, location)) {
                        console.log("current location has changed", location ?? currentLocation);
                        await produceCurrentLocation(location);
                        console.log("done producing");
                    }
                }
                produceAsync();

                return location ?? currentLocation;
            });

        } catch (e) {
            const error = e as Error;
            setErrorMsg(error.message);
            console.error(error.message);
        }
    }

    async function getCurrentLocation(): Promise<Location.LocationObject> {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted')
            throw new Error('Permission to access location was denied');
    
        return await Location.getCurrentPositionAsync({});
    }

    async function produceCurrentLocation(location: Location.LocationObject | null): Promise<ProducerResponseFormat | null> {
        if (!location)
            return null;

        try {
            return await producer.produce({
                records: [
                    {
                        key: "location_react_native",
                        value: [location.coords.latitude, location.coords.longitude]
                    }
                ]
            })
        } catch (e) {
            const apiException = catchApiException(e);
            setErrorMsg(apiException.message ?? "Producer fetch error");
            console.error(apiException);
            return null;
        }
    }

    /**
     * @param location1 
     * @param location2 
     * @returns true if all 3 coordinates are equal (`===`)
     */
    function locationEquals(location1: Location.LocationObject | null, location2: Location.LocationObject | null): boolean {
        // handle falsy args
        let isEqual = defaultEqualsFalsy(location1, location2);
        if (isEqual !== null)
            return isEqual;

        // compare all 3 coordinates
        return defaultEquals(location1!.coords.altitude, location2!.coords.altitude) 
            && defaultEquals(location1!.coords.latitude, location2!.coords.latitude)
            && defaultEquals(location1!.coords.longitude, location2!.coords.longitude);
    }

    return (
        <ThemedView style={{paddingTop: 100, paddingHorizontal: 20}}>
            <ThemedText>Current location: [{location?.coords.latitude}, {location?.coords.longitude}]</ThemedText>
            <Br />
            <Button title="Produce current location" onPress={() => {
                updateCurrentLocation();
            }} />
            
            <ThemedText style={{color: "red"}}>{errorMsg}</ThemedText>
        </ThemedView>
    )
}