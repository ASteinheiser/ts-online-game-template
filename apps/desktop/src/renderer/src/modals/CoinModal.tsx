// Disable linting errors for Three props on primitives
/* eslint react/no-unknown-property: "off" */
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useGLTF } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Button, Dialog, DialogContent, DialogTitle, DialogFooter } from '@repo/ui';
import coinModel3D from '../assets/Coin.glb?url';

useGLTF.preload(coinModel3D);

interface CoinModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const CoinModal = ({ isOpen, onOpenChange }: CoinModalProps) => {
  return (
    <Dialog open={isOpen}>
      <DialogContent
        onOpenAutoFocus={(e) => e.preventDefault()}
        aria-describedby={undefined}
        disableCloseButton
        className="bg-transparent shadow-none"
      >
        <DialogTitle className="hidden">Coin</DialogTitle>

        <Canvas>
          <spotLight position={[10, 10, 10]} angle={0.3} penumbra={1} decay={0} intensity={Math.PI * 2} />
          <SpinningCoin scale={4} />
        </Canvas>

        <DialogFooter className="flex flex-col justify-center items-center gap-4">
          <h1 className="text-4xl font-pixel text-center">{'You got a "kill coin"!'}</h1>
          <h1 className="text-lg font-label text-center">{'"What am I supposed to do with this?"'}</h1>

          <Button size="lg" className="py-7 px-8" onClick={() => onOpenChange(false)}>
            <h1 className="text-2xl font-pixel">Hell yeah!</h1>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface SpinningCoinProps {
  position?: [number, number, number];
  scale?: number;
}

const SpinningCoin = ({ position = [0, 0, 0], scale = 1 }: SpinningCoinProps) => {
  const { scene } = useGLTF(coinModel3D);
  const ref = useRef<THREE.Object3D>(null);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 3;
  });

  useMemo(() => {
    const gold = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      metalness: 1,
      roughness: 0.3,
    });

    scene.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        (child as THREE.Mesh).material = gold;
      }
    });
  }, [scene]);

  return <primitive object={scene} ref={ref} position={position} scale={scale} dispose={null} />;
};
