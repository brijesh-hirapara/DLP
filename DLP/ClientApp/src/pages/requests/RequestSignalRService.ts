// SignalRService.ts
import { HubConnectionBuilder, HubConnection, HttpTransportType } from '@microsoft/signalr';
import { SIGNALR_HUB_URL } from 'api/base';

type ReceiveBidCallback = (id: string, status: string) => void;

const startConnection = async (onReceiveBidCallback: ReceiveBidCallback) => {
  let connection: HubConnection | undefined;

  try {
    connection = new HubConnectionBuilder()
      .withUrl(SIGNALR_HUB_URL, {
        skipNegotiation: true,
        transport: HttpTransportType.WebSockets,
        withCredentials: true
      })
      .withAutomaticReconnect()
      .build();

    connection.on('TransportStatusChanged', (id, status) => {
      console.log("📡 SignalR event received:", id, status);
      onReceiveBidCallback(id, status);
    });

    connection.onclose(error => console.log("SignalR closed:", error));
    connection.onreconnecting(error => console.log("SignalR reconnecting:", error));
    connection.onreconnected(connectionId => console.log("SignalR reconnected:", connectionId));

    await connection.start();
    console.log('✅ SignalR Connected!');
  } catch (error) {
    console.error('❌ SignalR Connection Error: ', error);
  }

  return connection;
};

export default startConnection;
