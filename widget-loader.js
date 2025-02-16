(function() {
  // Create container
  const container = document.createElement('div');
  container.id = 'finlit-widget';
  document.body.appendChild(container);

  // Load React
  const reactScript = document.createElement('script');
  reactScript.src = 'https://unpkg.com/react@17/umd/react.production.min.js';
  reactScript.crossOrigin = 'anonymous';

  // Load ReactDOM
  const reactDomScript = document.createElement('script');
  reactDomScript.src = 'https://unpkg.com/react-dom@17/umd/react-dom.production.min.js';
  reactDomScript.crossOrigin = 'anonymous';

  // Load Widget
  const widgetScript = document.createElement('script');
  widgetScript.src = 'https://leapthelimit.github.io/finlit.we/widget.js';

  // Initialize widget after everything is loaded
  widgetScript.onload = function() {
    if (window.FinLitWidget) {
      window.FinLitWidget.init('#finlit-widget');
    }
  };

  // Add scripts in sequence
  document.head.appendChild(reactScript);
  document.head.appendChild(reactDomScript);
  document.head.appendChild(widgetScript);
})(); 