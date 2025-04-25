declare module 'react-native-obd2' {
    const obd2: {
        ready: () => void;
        getBluetoothDeviceNameList: () => Promise<{ name: string; address: string }[]>;
        startLiveData: (address: string) => void;
        stopLiveData: () => void;
        mockTestData: (enable: boolean) => void;
    };

    export default obd2;
}  