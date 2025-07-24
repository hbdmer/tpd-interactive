
import './LegendPanel.css';

export default function LegendPanel({
  open,
  isNationOpen,
  onToggle,
  src,
  alt,
}) {
  const tabClasses = [
    'legend-tab',
    open             && 'open',
    isNationOpen     && 'legend-tab--shift-nation',
  ].filter(Boolean).join(' ');

  const panelClasses = [
    'resource-legend',
    open                       && 'open',
    isNationOpen && open       && 'resource-legend--shift-nation',
  ].filter(Boolean).join(' ');

  return (
    <>
      <div className={tabClasses} onClick={onToggle}>
        Legend
      </div>
      <div className={panelClasses}>
        <img src={src} alt={alt} />
      </div>
    </>
  );
}
