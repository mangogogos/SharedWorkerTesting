export enum WorkerEventType {
    SetPortId,
    Message,
}

export enum MessageRecipient {
    Worker,
    Others,
}

interface IWorkerEvent<EventType, EventData> {
    readonly type: EventType;
    readonly data: EventData;
}

type IWorkerMessageEvent<Recipient extends MessageRecipient> = IWorkerEvent<WorkerEventType.Message, {
    readonly recipient: Recipient;
    readonly message: string;
}>

export type WorkerEvent =
    | IWorkerEvent<WorkerEventType.SetPortId, number>
    | IWorkerMessageEvent<MessageRecipient.Worker>
    | IWorkerMessageEvent<MessageRecipient.Others>;
