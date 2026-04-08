import leafImg from '@/../attached_assets/image_1775640638603.png';

export default function CannabisLeaf({ className = '', active, ...props }) {
  const baseFilter = active
    ? 'brightness(0) saturate(100%) invert(42%) sepia(52%) saturate(500%) hue-rotate(90deg) brightness(95%) contrast(90%)'
    : 'brightness(0) invert(1)';

  return (
    <img
      src={leafImg}
      alt=""
      draggable={false}
      className={className}
      style={{ filter: baseFilter, objectFit: 'contain' }}
      {...props}
    />
  );
}
