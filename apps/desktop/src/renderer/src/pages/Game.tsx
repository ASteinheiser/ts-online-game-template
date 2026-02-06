import { useEffect, useRef, useCallback, useState } from 'react';
import { gql } from '@apollo/client';
import { useQuery } from '@apollo/client/react';
import { useSession } from '@repo/client-auth/provider';
import { useSearchParamFlag } from '@repo/ui/hooks';
import { toast } from '@repo/ui';
import { PhaserGame, type PhaserGameRef } from '../game/PhaserGame';
import type { MainMenu } from '../game/scenes/MainMenu';
import type { Game as GameScene } from '../game/scenes/Game';
import { EventBus, EVENT_BUS } from '../game/EventBus';
import type { Desktop_GetTotalPlayersQuery, Desktop_GetTotalPlayersQueryVariables } from '../graphql';
import { ProfileModal } from '../modals/ProfileModal';
import { NewPasswordModal } from '../modals/NewPasswordModal';
import { SettingsModal } from '../modals/SettingsModal';
import { CoinModal } from '../modals/CoinModal';
import { SEARCH_PARAMS } from '../router/constants';
import { useAudioSettings } from '../providers/AudioSettingsProvider';

const GET_TOTAL_PLAYERS = gql`
  query Desktop_GetTotalPlayers {
    totalPlayers
  }
`;

export const Game = () => {
  const { session } = useSession();
  const { isMuted, volume } = useAudioSettings();

  const phaserRef = useRef<PhaserGameRef | null>(null);

  const { data } = useQuery<Desktop_GetTotalPlayersQuery, Desktop_GetTotalPlayersQueryVariables>(
    GET_TOTAL_PLAYERS
  );
  console.log({ totalPlayers: data?.totalPlayers ?? 0 });

  const [isProfileModalOpen, setIsProfileModalOpen] = useSearchParamFlag(SEARCH_PARAMS.PROFILE);
  const [isNewPasswordModalOpen, setIsNewPasswordModalOpen] = useSearchParamFlag(SEARCH_PARAMS.NEW_PASSWORD);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useSearchParamFlag(SEARCH_PARAMS.SETTINGS);
  const [isCoinModalOpen, setIsCoinModalOpen] = useState(false);

  const setPhaserInputEnabled = useCallback(() => {
    const disabled = isProfileModalOpen || isNewPasswordModalOpen || isSettingsModalOpen || isCoinModalOpen;

    if (phaserRef?.current?.game?.input) {
      phaserRef.current.game.input.enabled = !disabled;
    }
  }, [isProfileModalOpen, isNewPasswordModalOpen, isSettingsModalOpen, isCoinModalOpen, phaserRef?.current]);

  useEffect(() => {
    setPhaserInputEnabled();
  }, [setPhaserInputEnabled]);

  const onCurrentSceneChange = (_scene: Phaser.Scene) => {
    // ensure that new scenes have the correct "input enabled" setting
    // for example, handles the case where the scene changes with a modal open
    setPhaserInputEnabled();

    // handle closing modals when leaving a scene
    setIsProfileModalOpen(false);
    setIsNewPasswordModalOpen(false);
    setIsSettingsModalOpen(false);
    setIsCoinModalOpen(false);
  };

  // NOTE: the server will kick any clients with an expired token, however
  // supabase will automatically refresh the token before it expires (every hour)
  useEffect(() => {
    if (!session?.access_token) return;

    const scene = phaserRef?.current?.scene as GameScene;
    scene?.refreshToken?.({ token: session.access_token });
  }, [session]);

  useEffect(() => {
    EventBus.on(EVENT_BUS.GAME_START, () => {
      if (!session?.access_token) return;
      const scene = phaserRef?.current?.scene as MainMenu;

      scene?.startGame?.({ token: session.access_token });
    });

    return () => {
      EventBus.off(EVENT_BUS.GAME_START);
    };
  }, [session]);

  useEffect(() => {
    EventBus.on(EVENT_BUS.PROFILE_OPEN, () => setIsProfileModalOpen(true));
    EventBus.on(EVENT_BUS.SETTINGS_OPEN, () => setIsSettingsModalOpen(true));
    EventBus.on(EVENT_BUS.COIN_OPEN, () => setIsCoinModalOpen(true));
    EventBus.on(EVENT_BUS.JOIN_ERROR, (error) => toast.error(error.message));
    EventBus.on(EVENT_BUS.RECONNECTION_ATTEMPT, (attempt) => toast.info(`Reconnecting... (${attempt})`));

    return () => {
      EventBus.off(EVENT_BUS.PROFILE_OPEN);
      EventBus.off(EVENT_BUS.SETTINGS_OPEN);
      EventBus.off(EVENT_BUS.COIN_OPEN);
      EventBus.off(EVENT_BUS.JOIN_ERROR);
      EventBus.off(EVENT_BUS.RECONNECTION_ATTEMPT);
    };
  }, []);

  useEffect(() => {
    phaserRef?.current?.game?.sound.setMute(isMuted);
  }, [isMuted]);

  useEffect(() => {
    phaserRef?.current?.game?.sound.setVolume(volume / 100);
  }, [volume]);

  return (
    <>
      <PhaserGame ref={phaserRef} currentActiveScene={onCurrentSceneChange} />

      <SettingsModal isOpen={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen} />
      <ProfileModal isOpen={isProfileModalOpen} onOpenChange={setIsProfileModalOpen} />
      <NewPasswordModal isOpen={isNewPasswordModalOpen} onOpenChange={setIsNewPasswordModalOpen} />
      <CoinModal isOpen={isCoinModalOpen} onOpenChange={setIsCoinModalOpen} />
    </>
  );
};
