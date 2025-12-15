import React, { useState, useEffect } from "react";

const RavenChatEmbed = (props) => {
  // Safely extract props with proper defaults and type conversion
  const url = props?.url || "https://erp.elbrit.org/raven";
  const height = typeof props?.height === 'number' ? props.height : 720;
  const showBorder = Boolean(props?.showBorder);
  const borderRadius = typeof props?.borderRadius === 'number' ? props.borderRadius : 10;
  
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Ensure height is a valid CSS value
  const heightValue = typeof height === 'number' ? `${height}px` : height;

  // Detect iframe load errors (CSP violations, connection refused, etc.)
  useEffect(() => {
    // Set a timeout to detect if iframe fails to load
    const timeout = setTimeout(() => {
      if (!loaded && !error) {
        setError(true);
        setErrorMessage("Connection timeout - The chat server may be blocking iframe embedding.");
      }
    }, 5000); // 5 second timeout

    return () => clearTimeout(timeout);
  }, [loaded, error]);

  const handleIframeError = () => {
    setError(true);
    setErrorMessage("Unable to load chat - The server is blocking iframe embedding for security reasons.");
  };

  const handleIframeLoad = (e) => {
    // Check if iframe actually loaded content
    try {
      const iframe = e.target;
      // Try to access iframe content to verify it loaded
      // If CSP blocks it, this will throw an error
      if (iframe.contentWindow && iframe.contentWindow.location) {
        setLoaded(true);
        setError(false);
      }
    } catch (err) {
      // Cross-origin or CSP violation - this is expected for blocked iframes
      // The iframe may still appear to "load" but content is blocked
      setError(true);
      setErrorMessage("erp.elbrit.org refused to connect - The server is blocking iframe embedding.");
    }
  };

  const openInNewWindow = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // If there's an error, show a user-friendly message with a link
  if (error) {
    return (
      <div
        style={{
          width: "100%",
          height: heightValue,
          border: showBorder ? "1px solid #ddd" : "none",
          borderRadius: `${borderRadius}px`,
          overflow: "hidden",
          position: "relative",
          background: "#f5f5f5",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "40px 20px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "48px",
            marginBottom: "20px",
            opacity: 0.6,
          }}
        >
          🚫
        </div>
        <h3
          style={{
            margin: "0 0 10px 0",
            color: "#333",
            fontSize: "18px",
            fontWeight: 600,
          }}
        >
          {errorMessage || "erp.elbrit.org refused to connect"}
        </h3>
        <p
          style={{
            margin: "0 0 20px 0",
            color: "#666",
            fontSize: "14px",
            maxWidth: "400px",
          }}
        >
          The chat server has security restrictions that prevent it from being embedded. 
          Please open it in a new window instead.
        </p>
        <button
          onClick={openInNewWindow}
          style={{
            padding: "12px 24px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: 500,
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseOver={(e) => e.target.style.backgroundColor = "#0056b3"}
          onMouseOut={(e) => e.target.style.backgroundColor = "#007bff"}
        >
          Open Raven Chat in New Window
        </button>
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        height: heightValue,
        border: showBorder ? "1px solid #ddd" : "none",
        borderRadius: `${borderRadius}px`,
        overflow: "hidden",
        position: "relative",
        background: "#f5f5f5",
      }}
    >
      {!loaded && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            fontSize: 14,
            zIndex: 1,
          }}
        >
          Loading Raven Chat...
        </div>
      )}
      <iframe
        src={url}
        title="Raven Chat"
        style={{
          width: "100%",
          height: "100%",
          border: "none",
          borderRadius: `${borderRadius}px`,
          opacity: loaded ? 1 : 0,
          transition: "opacity 0.3s",
        }}
        onLoad={handleIframeLoad}
        allow="clipboard-write; fullscreen"
      />
    </div>
  );
};

export { RavenChatEmbed };
export default RavenChatEmbed;
