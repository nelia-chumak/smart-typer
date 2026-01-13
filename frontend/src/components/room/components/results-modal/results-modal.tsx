import {
  BarElement,
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineElement,
  Title,
  Tooltip,
  TooltipItem,
} from 'chart.js';
import { AvatarSize } from 'common/enums/enums';
import { FC, Rating, VoidAction } from 'common/types/types';
import { Modal, UserLabel } from 'components/common/common';
import { RCBar } from 'components/external/external';

import styles from './styles.module.scss';

Chart.register(
  LinearScale,
  CategoryScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

type Props = {
  participantsRating: Rating;
  isVisible: boolean;
  onClose: VoidAction;
};

const ResultsModal: FC<Props> = ({
  participantsRating,
  isVisible,
  onClose,
}) => {
  const participantsNicknames = participantsRating.map(
    ({ nickname }) => nickname,
  );
  const participantsAverageSpeeds = participantsRating.map(
    ({ averageSpeed }) => averageSpeed,
  );
  const maxSpeed = Math.max(...participantsAverageSpeeds);
  const niceStep = (max: number): number => {
    if (max <= 5) return 0.5;
    if (max <= 20) return 1;
    if (max <= 50) return 2;
    if (max <= 100) return 5;
    return 10;
  };

  const stepSize = niceStep(maxSpeed);
  const maxY = Math.ceil(maxSpeed / stepSize) * stepSize;

  const data = {
    labels: participantsNicknames,
    datasets: [
      {
        data: participantsAverageSpeeds,
        backgroundColor: '#4bba73',
        borderWidth: 0,
        borderColor: '#4bba73',
        borderRadius: 8,
        barPercentage: 0.75,
        categoryPercentage: 0.8,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        callbacks: {
          label: (ctx: TooltipItem<'bar'>): string =>
            `Average speed: ${ctx.parsed.y}`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        min: 0,
        max: maxY,
        ticks: {
          stepSize,
          font: {
            size: 16,
          },
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          font: {
            size: 16,
          },
        },
        grid: {
          display: false,
        },
      },
    },
    responsive: true,
    maintainAspectRatio: false,
  };

  return (
    <Modal
      isVisible={isVisible}
      onHide={onClose}
      title="Game results"
      className={styles.resultsModal}
    >
      <div className={styles.modalBody}>
        <div className={styles.chart}>
          <RCBar data={data} options={options} />
        </div>
        <div className={styles.participantsRating}>
          {participantsRating.map(({ id, nickname, photoUrl }, i) => {
            return (
              <div className={styles.participantsProfiles} key={id}>
                <span className={styles.ratingNumeration}>{i + 1}</span>
                <UserLabel
                  userName={nickname}
                  avatarSrc={photoUrl}
                  avatarSize={AvatarSize.SMALL}
                ></UserLabel>
              </div>
            );
          })}
        </div>
      </div>
    </Modal>
  );
};

export { ResultsModal };
