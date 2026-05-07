import { RuneRuinsScene } from '@/components/gateway/RuneRuinsScene';
import { HintSystem } from '@/components/gateway/HintSystem';
import { AwakeningOverlay } from '@/components/gateway/AwakeningOverlay';
import { GatewayBootstrap } from '@/components/gateway/GatewayBootstrap';
import { ProgressDots } from '@/components/gateway/ProgressDots';
import { WheelDolly } from '@/components/gateway/WheelDolly';

export default function GatewayPage() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-ink">
      <GatewayBootstrap />
      <WheelDolly />
      <div className="absolute inset-0">
        <RuneRuinsScene />
      </div>
      <ProgressDots />
      <HintSystem />
      <AwakeningOverlay />
    </main>
  );
}
