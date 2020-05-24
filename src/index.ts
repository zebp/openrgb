import OpenRGBClient from "./client";

const start = async () => {
    const client = new OpenRGBClient({
        host: "localhost",
        port: 1337,
        name: "nodejs"
    });

    await client.connect();
    const controllerCount = await client.getControllerCount();

    for (let deviceId = 0; deviceId < controllerCount; deviceId++) {
        const device = await client.getDeviceController(deviceId);
        const colors = Array(device.colors.length).fill({
            red: 0x00,
            green: 0x50,
            blue: 0xFF
        });

        console.log(`Setting the color of ${device.name}`);
        await client.updateLeds(deviceId, colors);
    }
};

start();