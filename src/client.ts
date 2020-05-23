import { Socket as NodeSocket } from "net";
import { PromiseSocket as Socket } from "promise-socket";
import Command from "./command";
import OpenRGBDevice from "./device";

const HEADER_SIZE = 16;

type OpenRGBHeader = {
    deviceId: number;
    length: number;
    commandId: Command;
}

export type ClientOptions = {
    host: string;
    port: number;
    name: string;
};

export default class OpenRGBClient {
    private host: string;
    private port: number;
    private name: string;

    private socket?: Socket<NodeSocket>;

    public constructor(options: ClientOptions) {
        this.host = options.host;
        this.port = options.port;
        this.name = options.name;
    }

    public async connect(): Promise<void> {
        this.socket = new Socket(new NodeSocket());
        await this.socket.connect(this.port, this.host);

        await new Promise(resolve => setTimeout(resolve, 1000));

        const nameBytes = new TextEncoder().encode(this.name);
        await this.sendMessage(Command.SetClientName, nameBytes as Buffer);
    }

    public async getControllerCount(): Promise<number> {
        await this.sendMessage(Command.RequestControllerCount);

        const buffer = await this.readMessage();
        return buffer.readUInt32LE();
    }

    public async getController(deviceId: number): Promise<OpenRGBDevice> {
        await this.sendMessage(Command.RequestControllerData, undefined, deviceId);

        const buffer = await this.readMessage();
        return new OpenRGBDevice(buffer);
    }

    private async sendMessage(commandId: Command, buffer = Buffer.alloc(0), deviceId = 0): Promise<void> {
        const header = this.encodeHeader(commandId, buffer.byteLength, deviceId);
        const packet = Buffer.concat([header, buffer]);
        await this.socket?.write(packet);
    }

    private async readMessage(): Promise<Buffer> {
        const headerBuffer = await this.socket?.read(HEADER_SIZE) as Buffer | undefined;

        if (headerBuffer === undefined) {
            throw new Error("connection has ended");
        }

        const header = this.decodeHeader(headerBuffer);
        const packetBuffer = await this.socket?.read(header.length) as Buffer | undefined;

        if (packetBuffer === undefined) {
            throw new Error("connection has ended");
        }

        return packetBuffer;
    }

    private encodeHeader(commandId: Command, length: number, deviceId: number): Buffer {
        const buffer = Buffer.alloc(HEADER_SIZE);


        // I have no idea why eslint thinks this variable is unused, so we'll disable the warning
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        let index = buffer.write("ORGB", "ascii");
        index = buffer.writeUInt32LE(deviceId, index);
        index = buffer.writeUInt32LE(commandId as number, index);
        index = buffer.writeUInt32LE(length, index);

        return buffer;
    }

    private decodeHeader(buffer: Buffer): OpenRGBHeader {
        const deviceId = buffer.readUInt32LE(4);
        const commandId = buffer.readUInt32LE(8) as Command;
        const length = buffer.readUInt32LE(12);

        return { deviceId, commandId, length };
    }

}