import OpenRGBClient from "./client";
import OpenRGBDevice from "./device";

const start = async () => {
    const client = new OpenRGBClient({
        host: "localhost",
        port: 1337,
        name: "nodejs"
    });

    await client.connect();
    const controllerCount = await client.getControllerCount();

    const devices = [];

    for (let i = 0; i < controllerCount; i++) {
        const device = await client.getController(i);
        devices.push(device);
    }

    console.log(JSON.stringify(devices))
};

start();