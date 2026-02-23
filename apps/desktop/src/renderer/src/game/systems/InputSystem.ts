import { WS_EVENT, type InputPayload } from '@repo/core-game';
import type { Game } from '../scenes/Game';
import { EventBus, EVENT_BUS } from '../EventBus';

export class InputSystem {
  private inputSeq = 0;
  private cursorKeys?: Phaser.Types.Input.Keyboard.CursorKeys;
  private escapeKey?: Phaser.Input.Keyboard.Key;

  constructor(private scene: Game) {}

  public setupInputSystem() {
    this.escapeKey = this.scene.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.ESC);
    this.cursorKeys = this.scene.input.keyboard?.createCursorKeys();
  }

  public processInput() {
    if (!this.scene.roomSystem.room?.connection.isOpen || !this.cursorKeys || !this.escapeKey) {
      return;
    }

    // press escape to open the settings menu
    if (this.escapeKey.isDown) {
      EventBus.emit(EVENT_BUS.SETTINGS_OPEN);
    }

    // press shift to leave the game
    if (this.cursorKeys.shift.isDown) {
      this.scene.roomSystem.room?.send(WS_EVENT.LEAVE_ROOM);
      return;
    }

    const inputPayload: InputPayload = {
      seq: this.inputSeq++,
      left: this.cursorKeys.left.isDown,
      right: this.cursorKeys.right.isDown,
      up: this.cursorKeys.up.isDown,
      down: this.cursorKeys.down.isDown,
      attack: this.cursorKeys.space.isDown,
    };
    // send the input to the server
    this.scene.roomSystem.room?.send(WS_EVENT.PLAYER_INPUT, inputPayload);

    return inputPayload;
  }
}
