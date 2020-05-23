import OpenRGBClient from "./client";

const start = async () => {
    const client = new OpenRGBClient({
        host: "localhost",
        port: 1337,
        name: "nodejs"
    });

    await client.connect();
    const controllerCount = await client.getControllerCount();
    console.log(controllerCount);
};

start();