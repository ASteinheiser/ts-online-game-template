import { WS_EVENT } from '@repo/core-game';
import type { Game } from '../scenes/Game';
import { CustomText } from './CustomText';

const MARGIN = 16;
const PADDING = 6;
const CORNER_RADIUS = 8;
const FPS_OFFSET = 38;

export class PingDisplay {
  private pingStartTime = 0;
  private currentPingMs = 0;
  private timerEvent?: Phaser.Time.TimerEvent;
  private background: Phaser.GameObjects.Graphics;
  private pingText: CustomText;

  constructor(private scene: Game) {
    this.background = this.scene.add.graphics().setScrollFactor(0).setDepth(102);

    this.pingText = new CustomText(this.scene, 0, 0, '--', {
      fontFamily: 'Montserrat',
      fontSize: 14,
      color: '#00ff00',
    })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    const layout = () => {
      const { width } = this.scene.scale;
      this.pingText.setPosition(width - MARGIN, MARGIN + FPS_OFFSET);
      this.updateBackgroundSize();
    };

    layout();
    this.scene.scale.on(Phaser.Scale.Events.RESIZE, layout);
    this.scene.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.scene.scale.off(Phaser.Scale.Events.RESIZE, layout);
    });

    this.setup();
  }

  public destroy() {
    this.timerEvent?.remove();
    delete this.timerEvent;
    this.pingText.destroy();
    this.background.destroy();
  }

  private setup() {
    if (!this.scene.roomSystem.room) return;

    this.scene.roomSystem.room.onMessage(WS_EVENT.PONG, () => {
      this.currentPingMs = Date.now() - this.pingStartTime;
      this.updateDisplay();
    });

    this.timerEvent = this.scene.time.addEvent({
      delay: 1000,
      loop: true,
      callback: () => this.sendPing(),
    });
    // Start the first ping immediately
    this.sendPing();
  }

  private sendPing() {
    if (!this.scene.roomSystem.room?.connection.isOpen) return;
    this.pingStartTime = Date.now();
    this.scene.roomSystem.room.send(WS_EVENT.PING);
  }

  private updateDisplay() {
    const color = this.getPingColor(this.currentPingMs);
    const pingText = `${this.currentPingMs}ms`;

    this.pingText.setColor(color).setText(pingText);
    this.updateBackgroundSize();
  }

  private getPingColor(pingMs: number): string {
    if (pingMs < 50) return '#00ff00';
    if (pingMs < 100) return '#ffff00';
    if (pingMs < 200) return '#ff8800';
    return '#ff0000';
  }

  private updateBackgroundSize() {
    const bgWidth = this.pingText.displayWidth + PADDING * 2;
    const bgHeight = this.pingText.displayHeight + PADDING * 2;
    const bgX = this.pingText.x - bgWidth + PADDING;
    const bgY = this.pingText.y - PADDING;

    this.background.clear();
    this.background.fillStyle(0x000000, 0.5).fillRoundedRect(bgX, bgY, bgWidth, bgHeight, CORNER_RADIUS);
  }
}
