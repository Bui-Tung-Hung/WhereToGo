import { IonIcon } from '@ionic/react';
import { locationOutline, navigateOutline } from 'ionicons/icons';
import { useNavigate } from 'react-router-dom';
import { HomeCardLayout } from './HomeCardLayout';

export interface NearbyCardProps {
  /** Vị trí của thẻ trong danh sách trang chủ. */
  cascadeIndex: number;
}

/** Thẻ "Gần tôi" dưới các thẻ nhóm (U4); tạm mở danh sách Gần tôi cũ (P9). */
export function NearbyCard({ cascadeIndex }: NearbyCardProps): React.JSX.Element {
  const navigate = useNavigate();
  return (
    <HomeCardLayout
      icon={locationOutline}
      label="Gần tôi"
      prompt="Quanh đây có gì?"
      aside={
        <div className="wtg-nearby-icon" aria-hidden="true">
          <IonIcon icon={navigateOutline} />
        </div>
      }
      ariaLabel="Gần tôi"
      onOpen={() => navigate('/nearby')}
      cascadeIndex={cascadeIndex}
    />
  );
}
