import { WebSocketServer } from 'ws';

import { WsMessageHandler } from '@/handler/ws-message-handler';
import { MemGameMapRepository } from '@/repository/mem-gamemap-repository';
import { MemUserRepository } from '@/repository/mem-user-repository';
import { WsRepository } from '@/repository/ws-repository';
import { GameMapService } from '@/service/map-service';
import { UserService } from '@/service/user-service';

(async () => {
  const wsRepository = new WsRepository();

  const mapRepository = new MemGameMapRepository();
  const mapService = new GameMapService(mapRepository);
  mapService.createDefaultMap();

  const userRepository = new MemUserRepository();
  const userService = new UserService(userRepository);

  const webSocketHandler = new WsMessageHandler(userService, mapService, wsRepository);

  const wss = new WebSocketServer({
    port: 8080,
    path: "/ws"
  })

  wss.on("connection", webSocketHandler.onConnect);
})()

