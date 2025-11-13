import { CROPPED_IMAGE_TYPE } from 'common/constants/constants';
import { FC, VoidAction } from 'common/types/types';
import { Modal } from 'components/common/common';
import { ReactCrop } from 'components/external/external';
import { canvasToBlob, canvasToDataUrl } from 'helpers/helpers';
import { useMemo, useState } from 'hooks/hooks';
import { Crop, CropData } from '../../common/types/types';

import styles from './styles.module.scss';

type Props = {
  isVisible: boolean;
  file: File | null;
  onClose: VoidAction;
  onUpdateAvatar: (croppedFile: File, croppedFileUrl: string) => void;
};

const CropAvatar: FC<Props> = ({
  isVisible,
  file,
  onClose,
  onUpdateAvatar,
}) => {
  const [crop, setCrop] = useState<Crop>({
    unit: '%',
    x: 0,
    y: 0,
    width: 130,
    height: 130,
  });
  const [image, setImage] = useState<HTMLImageElement | null>(null);

  const src = useMemo(() => {
    return file ? URL.createObjectURL(file) : '';
  }, [(file as File)?.name]);

  const onCropChange = (newCrop: Crop): void => {
    setCrop(newCrop);
  };

  const onImageLoaded = (photo: HTMLImageElement): void => {
    setImage(photo);
  };

  const getCroppedPhoto = (
    photo: HTMLImageElement,
    cropData: CropData,
  ): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    const scaleX = photo.naturalWidth / photo.width;
    const scaleY = photo.naturalHeight / photo.height;
    canvas.width = cropData.width;
    canvas.height = cropData.height;
    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;

    ctx.drawImage(
      photo,
      cropData.x * scaleX,
      cropData.y * scaleY,
      cropData.width * scaleX,
      cropData.height * scaleY,
      0,
      0,
      cropData.width,
      cropData.height,
    );

    return canvas;
  };

  const handleSubmit = async (): Promise<void> => {
    const croppedPhoto = getCroppedPhoto(
      image as HTMLImageElement,
      crop as CropData,
    );
    const croppedImageBlob = await canvasToBlob(croppedPhoto);
    const croppedImageFile = new File([croppedImageBlob], (file as File).name, {
      type: CROPPED_IMAGE_TYPE,
    });

    const croppedImageUrl = canvasToDataUrl(croppedPhoto);

    onClose();
    onUpdateAvatar(croppedImageFile, croppedImageUrl);
  };

  if (!file) {
    return null;
  }

  return (
    <Modal
      isVisible={isVisible}
      submitButton={{
        isDisabled: !src,
        label: 'OK',
        onClick: handleSubmit,
      }}
      cancelButton={{
        isDisabled: !src,
        label: 'Cancel',
        onClick: onClose,
      }}
      title="Crop the avatar"
      className={styles.cropModal}
    >
      <ReactCrop
        crop={crop}
        onChange={onCropChange}
        keepSelection
        circularCrop
        aspect={1}
      >
        <img src={src} onLoad={(e) => onImageLoaded(e.currentTarget)} alt="" />
      </ReactCrop>
    </Modal>
  );
};

export { CropAvatar };
