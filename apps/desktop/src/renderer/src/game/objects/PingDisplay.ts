import type { Room } from 'colyseus.js';
import { Scenes } from 'phaser';
import { CustomText } from './CustomText';
import { WS_EVENT } from '@repo/core-game';

const MARGIN = 16;
const PADDING = 6;
const CORNER_RADIUS = 8;

export class PingDisplay {
  scene: Phaser.Scene;
  room?: Room;
  pingStartTime = 0;
  currentPingMs = 0;
  timerEvent?: Phaser.Time.TimerEvent;
  background: Phaser.GameObjects.Graphics;
  pingText: CustomText;

  constructor(scene: Phaser.Scene) {
    this.scene = scene;

    this.pingText = new CustomText(this.scene, 0, 0, '--', {
      fontFamily: 'Montserrat',
      fontSize: 14,
      color: '#00ff00',
    })
      .setOrigin(1, 0)
      .setScrollFactor(0);

    this.background = this.scene.add.graphics().setScrollFactor(0).setDepth(99);

    const layout = () => {
      const { width } = this.scene.scale;
      this.pingText.setPosition(width - MARGIN, MARGIN);
      this.updateBackgroundSize();
    };

    layout();
    this.scene.scale.on(Phaser.Scale.Events.RESIZE, layout);
    this.scene.events.once(Scenes.Events.SHUTDOWN, () => {
      this.scene.scale.off(Phaser.Scale.Events.RESIZE, layout);
    });
  }

  start(room: Room) {
    this.room = room;

    this.room.onMessage(WS_EVENT.PONG, () => {
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

  sendPing() {
    if (!this.room || !this.room.connection.isOpen) return;
    this.pingStartTime = Date.now();
    this.room.send(WS_EVENT.PING);
  }

  updateDisplay() {
    const color = this.getPingColor(this.currentPingMs);
    const pingText = `${this.currentPingMs}ms`;

    this.pingText.setColor(color).setText(pingText);
    this.updateBackgroundSize();
  }

  getPingColor(pingMs: number): string {
    if (pingMs < 50) return '#00ff00';
    if (pingMs < 100) return '#ffff00';
    if (pingMs < 200) return '#ff8800';
    return '#ff0000';
  }

  updateBackgroundSize() {
    const bgWidth = this.pingText.displayWidth + PADDING * 2;
    const bgHeight = this.pingText.displayHeight + PADDING * 2;
    const bgX = this.pingText.x - bgWidth + PADDING;
    const bgY = this.pingText.y - PADDING;

    this.background.clear();
    this.background.fillStyle(0x000000, 0.5).fillRoundedRect(bgX, bgY, bgWidth, bgHeight, CORNER_RADIUS);
  }

  destroy() {
    this.timerEvent?.remove();
    delete this.timerEvent;
    this.pingText.destroy();
    this.background.destroy();
  }
}
