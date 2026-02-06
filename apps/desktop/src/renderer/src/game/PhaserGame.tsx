import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import { StartGame } from './main';
import { EventBus, EVENT_BUS } from './EventBus';
import { GAME_CONTAINER_ID } from './constants';

export interface PhaserGameRef {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

interface PhaserGameProps {
  ref: RefObject<PhaserGameRef | null>;
  currentActiveScene?: (scene_instance: Phaser.Scene) => void;
}

export const PhaserGame = ({ currentActiveScene, ref }: PhaserGameProps) => {
  const game = useRef<Phaser.Game | null>(null);

  useLayoutEffect(() => {
    if (game.current === null) {
      game.current = StartGame(GAME_CONTAINER_ID);
      ref.current = { game: game.current, scene: null };
    }

    return () => {
      if (game.current) {
        game.current.destroy(true);
        if (game.current !== null) {
          game.current = null;
        }
      }
    };
  }, [ref]);

  useEffect(() => {
    EventBus.on(EVENT_BUS.CURRENT_SCENE_READY, (scene_instance: Phaser.Scene) => {
      if (currentActiveScene && typeof currentActiveScene === 'function') {
        currentActiveScene(scene_instance);
      }
      ref.current = { game: game.current, scene: scene_instance };
    });

    return () => {
      EventBus.removeListener(EVENT_BUS.CURRENT_SCENE_READY);
    };
  }, [currentActiveScene, ref]);

  return <div id={GAME_CONTAINER_ID}></div>;
};
