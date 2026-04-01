import { defaultEquals, defaultEqualsFalsy, sleep } from '@/utils/utils';
import 'leaflet/dist/leaflet.css';
import { useEffect, useState } from "react";
import { MapContainer, Marker, TileLayer } from "react-leaflet";
import { catchApiException, Consumer, CustomApiResponseFormat } from "redpanda";

type CustomLocation = [number, number];

/**
 * Consume position from kafka and display on a live map.
 */
export default function KafkaMap() {
    const componentName = "KafkaMap";
    const consumptionIntervalMillis = 500;

    // [latitude, longitude] ([x, y])
    const [position, setPostion] = useState<CustomLocation>([52.2689, 10.5268]);
    const [consumptionInterval, setConsumptionInterval] = useState<NodeJS.Timeout | null>(null);

    const [consumer, ] = useState(
        new Consumer(
            ["test"], "group1", "consumer1", 
            {
                baseUrl: "http://localhost:8080/api/kafka"
            },
        )
        .consumerInstanceTimeout(6001)
)
    const [isConsumerInitialized, setConsumerInitialized] = useState(false);

    // initialize consumer
    useEffect(() => {
        async function initConsumer(): Promise<void> {
            let apiException: CustomApiResponseFormat = {statusCode: 204};

            try {
                await consumer.init();
            } catch (e) {
                const apiException = catchApiException(e); // could be 409 which would be expected
                console.log("catch", apiException);
                
            } finally {
                await sleep(1000);
                if (apiException.statusCode !== 401)
                    setConsumerInitialized(true);
            }
        }

        initConsumer();
    }, []);
    
    // start consuming at an interval
    useEffect(() => {
        if (isConsumerInitialized) {
            console.log("start consumption interval");
            
            const interval = setInterval(() => {
                updateLocation();
            }, consumptionIntervalMillis);

            setConsumptionInterval(interval);

            // clean up
            return () => {
                console.log("clean up consumption interval", interval);
        
                if (interval)
                    clearInterval(interval);
        
                consumer.delete();
            }
        }
    }, [isConsumerInitialized]);

    /**
     * Update the `currentLocation` state if new data is present or leave it unmodified.
     * 
     * @throws if consumption failed
     */
    async function updateLocation(): Promise<void> {
        const newLocation = await consumeLocation();
        setPostion((currentLocation) => {
            if (locationEquals(currentLocation, newLocation))
                console.log("Location changed", newLocation ?? currentLocation);
            
            return newLocation ?? currentLocation;
        });
    }

    /**
     * @returns latest location or `position` if no new location is available
     * @throws if consumption failed
     */
    async function consumeLocation(): Promise<CustomLocation | null> {
        if (!isConsumerInitialized)
            throw Error(`Initialize the consumer before consuming`);

        const response = await consumer.consume();

        // case: no new location
        if (!response.length)
            return null;

        // TODO: handle malformed response
        // TODO: only read from "location" key
        
        const latestLocation = response[response.length - 1];

        // TODO: remove cast eventually
        return latestLocation.value as any as CustomLocation;
    }

    /**
     * @param location1 
     * @param location2 
     * @returns true if all 3 coordinates are equal (`===`)
     */
    function locationEquals(location1: CustomLocation | null, location2: CustomLocation | null): boolean {
        // handle falsy args
        let isEqual = defaultEqualsFalsy(location1, location2);
        if (isEqual !== null)
            return isEqual;

        // compare all 3 coordinates
        return defaultEquals(location1![0], location2![0]) 
            && defaultEquals(location1![1], location2![1]);
    }
    
    return (
        <div className={componentName}>
            <div>{!isConsumerInitialized ? "initializing consumer..." : "Consumer ready"}</div>
            <br />

            <button onClick={updateLocation}>Consume now</button>
            <br />

            <div className={`d-flex justify-content-center`}>
                <MapContainer 
                    center={position} 
                    zoom={15} 
                    className={`${componentName}-map`}
                >
                    <TileLayer 
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" 
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <Marker position={position} />
                </MapContainer>
            </div>
        </div>
    )
}