import { WorkerEvent, WorkerEventType, MessageRecipient } from "./worker-event";

class Port {
    private portId: number = -1;
    private readonly innerWorker: SharedWorker.SharedWorker;

    constructor() {
        this.innerWorker = new SharedWorker('worker.js');
        this.innerWorker.onerror = errorEvent => console.error('Connection error from main', this.portId, errorEvent);

        this.innerWorker.port.onmessage = event => this.onMessage(event.data);
        this.innerWorker.port.onmessageerror = error => console.error('Message error from worker', this.portId, error);
        this.innerWorker.port.start();

        (globalThis as any).port = this;
    }

    postMessage(event: WorkerEvent) {
        this.innerWorker.port.postMessage(event);
    }

    onMessage(event: WorkerEvent) {
        if (event.type === WorkerEventType.SetPortId) {
            this.portId = event.data;
            return;
        }

        this.throwIfPortIdNotSet();

        if (event.data.recipient !== MessageRecipient.Others) {
            return;
        }

        console.log('Received message from others', this.portId, event.data.message);
    }

    private throwIfPortIdNotSet() {
        if (this.portId < 1) {
            throw new Error('Message received without valid port id');
        }
    }
}

const port = new Port();
port.postMessage({type: WorkerEventType.Message, data: {recipient: MessageRecipient.Others, message: 'This is a message for other contexts'}});
port.postMessage({type: WorkerEventType.Message, data: {recipient: MessageRecipient.Worker, message: 'This is a message for the worker'}});
