function CatalogueLoader({ label = 'Loading catalogue…', inline = false }) {
  return (
    <div
      className={inline ? 'catalogue-loader catalogue-loader--inline' : 'catalogue-loader'}
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="catalogue-loader-spinner" aria-hidden />
      <span className="catalogue-loader-text">{label}</span>
    </div>
  );
}

export default CatalogueLoader;
