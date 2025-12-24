import { SpinnerSize } from 'common/enums/enums';
import { CreateRoomRequestDto, FC } from 'common/types/types';
import { Button, Spinner } from 'components/common/common';
import { useDispatch, useEffect, useSelector, useState } from 'hooks/hooks';
import { racing as racingActions } from 'store/modules/actions';
import {
  CreateRoomModal,
  RoomCard,
  ShareRoomModal,
} from './components/components';

import styles from './styles.module.scss';

const Rooms: FC = () => {
  const dispatch = useDispatch();
  const {
    shareRoomUrl,
    rooms,
    areRoomsLoading,
    isRoomCreating,
    isRoomUrlSending,
  } = useSelector(({ racing, requests }) => ({
    rooms: racing.availableRooms,
    shareRoomUrl: racing.shareRoomUrl,
    areRoomsLoading: requests.racingLoadAvailableRooms,
    isRoomCreating: requests.racingCreateRoom,
    isRoomUrlSending: requests.racingSendRoomUrlToEmails,
  }));

  const [isCreateRoomModalVisible, setIsCreateRoomModalVisible] =
    useState(false);
  const [isShareRoomModalVisible, setIsShareRoomModalVisible] = useState(false);

  const handleToggleCreateRoomModalVisible = (): void => {
    setIsCreateRoomModalVisible((prev: boolean) => !prev);
  };

  const handleShareRoomCancel = (): void => {
    setIsShareRoomModalVisible(false);
    dispatch(racingActions.resetShareRoomUrl());
  };

  const handleCreateRoomSubmit = (payload: CreateRoomRequestDto): void => {
    void dispatch(racingActions.createRoom(payload));
  };

  useEffect(() => {
    void dispatch(racingActions.loadAvailableRooms());
    return (): void => {
      dispatch(racingActions.resetAvailableRooms());
    };
  }, []);

  useEffect(() => {
    if (shareRoomUrl) {
      setIsCreateRoomModalVisible(false);
      setIsShareRoomModalVisible(true);
    }
  }, [shareRoomUrl]);

  return (
    <div className={styles.rooms}>
      <div className={styles.titleContainer}>
        <h1>Select the room to compete with like-minded</h1>
        <Button
          label="Create room"
          onClick={handleToggleCreateRoomModalVisible}
          className={styles.createRoomButton}
        />
      </div>
      {areRoomsLoading ? (
        <Spinner size={SpinnerSize.LARGE} />
      ) : (
        <div className={styles.roomCards}>
          {rooms.map((room) => (
            <RoomCard key={room.id} room={room} />
          ))}
        </div>
      )}
      <CreateRoomModal
        isVisible={isCreateRoomModalVisible}
        onClose={handleToggleCreateRoomModalVisible}
        onSubmit={handleCreateRoomSubmit}
        isSubmitting={isRoomCreating}
      />
      {!!shareRoomUrl && (
        <ShareRoomModal
          isVisible={isShareRoomModalVisible}
          onClose={handleShareRoomCancel}
          shareRoomUrl={shareRoomUrl}
          isRoomUrlSending={isRoomUrlSending}
        />
      )}
    </div>
  );
};

export { Rooms };
