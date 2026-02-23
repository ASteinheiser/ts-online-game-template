import { FIXED_TIME_STEP, type AuthPayload } from '@repo/core-game';
import { gql } from '@apollo/client';
import { client } from '../../graphql/client';
import type { Desktop_GetGameResultsQuery, Desktop_GetGameResultsQueryVariables } from '../../graphql';
import { EventBus, EVENT_BUS } from '../EventBus';
import { SCENE } from '../constants';
import { RoomSystem } from '../systems/RoomSystem';
import { InputSystem } from '../systems/InputSystem';
import { UISystem } from '../systems/UISystem';
import { PlayerSystem } from '../systems/PlayerSystem';
import { RemotePlayerSystem } from '../systems/RemotePlayerSystem';
import { EnemySystem } from '../systems/EnemySystem';

export class Game extends Phaser.Scene {
  private elapsedTime = 0;
  private uiSystem?: UISystem;
  public roomSystem = new RoomSystem(this);
  private inputSystem = new InputSystem(this);
  private playerSystem = new PlayerSystem(this);
  private remotePlayerSystem = new RemotePlayerSystem(this);
  private enemySystem = new EnemySystem(this);

  constructor() {
    super(SCENE.GAME);
  }

  preload() {
    this.inputSystem.setupInputSystem();
  }

  async create({ token }: AuthPayload) {
    await this.roomSystem.joinRoom(token);
    if (!this.roomSystem.room) {
      return this.sendToMainMenu('Failed to join room');
    }

    this.setupStateListeners();

    EventBus.emit(EVENT_BUS.CURRENT_SCENE_READY, this);
  }

  private setupStateListeners() {
    if (!this.roomSystem.room) return;

    this.cleanupScene();
    this.uiSystem = new UISystem(this);

    this.roomSystem.setupRoomEventListeners({
      setupStateListeners: () => this.setupStateListeners(),
      onPlayerAdded: (player, sessionId, $) => {
        this.playerSystem.handleCurrentPlayerAdded(player, sessionId, $);
        this.remotePlayerSystem.handleRemotePlayerAdded(player, sessionId, $);
      },
      onPlayerRemoved: this.remotePlayerSystem.handleRemotePlayerRemoved,
      onEnemyAdded: this.enemySystem.handleEnemyAdded,
      onEnemyRemoved: this.enemySystem.handleEnemyRemoved,
    });
  }

  // this is called by Phaser per frame (could be 30fps/60fps/120fps/etc)
  update(_: number, delta: number): void {
    // skip if not yet connected
    if (!this.roomSystem.room || !this.playerSystem.currentPlayer) return;

    this.elapsedTime += delta;
    while (this.elapsedTime >= FIXED_TIME_STEP) {
      this.elapsedTime -= FIXED_TIME_STEP;
      this.fixedTick();
    }

    this.playerSystem.interpolateLocalPlayer(delta, this.elapsedTime);
    this.remotePlayerSystem.interpolateRemotePlayers(delta);

    this.uiSystem?.fpsDisplay.update(delta);
  }

  private fixedTick() {
    const input = this.inputSystem.processInput();
    this.playerSystem.clientSidePrediction(input);
  }

  private cleanupScene() {
    this.uiSystem?.destroy();
    this.playerSystem.destroy();
    this.remotePlayerSystem.destroy();
    this.enemySystem.destroy();
  }

  public sendToMainMenu(message: string) {
    console.error(message);
    EventBus.emit(EVENT_BUS.TOAST_ERROR, message);

    this.roomSystem.cleanupRoom();
    this.cleanupScene();
    this.scene.start(SCENE.MAIN_MENU);
  }

  public async sendToGameOver() {
    const roomId = this.roomSystem.room?.roomId;
    if (!roomId) return;

    const gameResults = await this.getGameResults(roomId);

    this.roomSystem.cleanupRoom();
    this.cleanupScene();
    this.scene.start(SCENE.GAME_OVER, { gameResults });
  }

  private async getGameResults(roomId: string) {
    const { data } = await client.query<Desktop_GetGameResultsQuery, Desktop_GetGameResultsQueryVariables>({
      variables: { roomId },
      fetchPolicy: 'network-only',
      query: gql`
        query Desktop_GetGameResults($roomId: String!) {
          gameResults(roomId: $roomId) {
            username
            attackCount
            killCount
          }
        }
      `,
    });

    return data?.gameResults ?? [];
  }
}
