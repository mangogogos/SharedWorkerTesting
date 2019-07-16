import {WorkerEvent, WorkerEventType, MessageRecipient} from './worker-event';

const ports = new Map<number, Port>();
const workerContext: SharedWorker.SharedWorkerGlobalScope = globalThis as any;

class Port {
    constructor(
        private readonly id: number,
        private readonly innerPort: MessagePort,
    ) {
        innerPort.onmessage = event => this.onMessage(event.data);
        innerPort.onmessageerror = error => console.error('Message error from worker', this.id, error);
        innerPort.start();
    }

    postMessage(event: WorkerEvent) {
        this.innerPort.postMessage(event);
    }

    onMessage(event: WorkerEvent) {
        if (event.type !== WorkerEventType.Message) {
            return;
        }
        const {recipient, message} = event.data;
        switch (recipient) {
            case MessageRecipient.Worker:
                console.log('Worker message', message);
                return;

            case MessageRecipient.Others:
                for (const port of ports.values()) {
                    if (port.id === this.id) continue;
                    port.postMessage(event);
                    return;
                }
        }
    }
}

workerContext.onconnect = function (connectEvent) {
    const portId = ports.size + 1;
    const port = new Port(portId, connectEvent.ports[0]);
    ports.set(portId, port);
    port.postMessage({type: WorkerEventType.SetPortId, data: portId});
}

workerContext.onerror = function (errorEvent) {
    console.error('Worker error', errorEvent);
}
