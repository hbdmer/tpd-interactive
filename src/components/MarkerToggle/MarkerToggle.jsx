import './MarkerToggle.css';

export default function MarkerToggle({
  show,
  isNationOpen,
  onToggle,
}) {
  const classes = [
    'marker-tab',
    isNationOpen && 'marker-tab--shift-nation'
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} onClick={onToggle}>
      {show ? 'Hide Capitals' : 'Show Capitals'}
    </div>
  );
}
