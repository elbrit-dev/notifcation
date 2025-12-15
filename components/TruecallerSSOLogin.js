import React, { useCallback, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { doc, setDoc } from "firebase/firestore";
import app, { db } from "../firebase";
import { useRouter } from "next/router";

function generateUuidv4() {
  // RFC4122 version 4 UUID
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, (c) =>
    (
      c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> c / 4))
    ).toString(16)
  );
}

const TruecallerComponent = ({
  apiUrl,
  partnerKey = "Ygjev71b0c4b875ca4a6db4555432c639c179",
  partnerName = "App",
  privacyUrl = "https://yourdomain.com/privacy",
  termsUrl = "https://yourdomain.com/terms",
  ttl = 60000,
  lang = "en",
  loginPrefix = "getstarted",
  loginSuffix = "register",
  ctaPrefix = "use",
  ctaColor = "#f75d34",
  ctaTextColor = "#ffffff",
  btnShape = "round",
  skipOption = "useanothernum",
  buttonText = "Continue with Truecaller",
  showDebug = false,
  showStatus = true,
  showRequestId = false,
  fullWidth = false,
  className = "",
  onSuccess,
  onError,
  onFailure,
  enableAuthIntegration = false,
  redirectOnSuccess = true,
  redirectPath = "/",
}) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [requestId, setRequestId] = useState("");
  const [apiUrlState] = useState(apiUrl || "https://uat.elbrit.org");
  const [debugPayload, setDebugPayload] = useState(null);
  const retryCountRef = useRef(0);
  const isPollingRef = useRef(false);
  const pollStartTimeRef = useRef(null);

  const encodedPrivacyUrl = useMemo(
    () => encodeURIComponent(privacyUrl || ""),
    [privacyUrl]
  );
  const encodedTermsUrl = useMemo(
    () => encodeURIComponent(termsUrl || ""),
    [termsUrl]
  );

  const log = useCallback(
    (text) => {
      if (showDebug) {
        // eslint-disable-next-line no-console
        console.log(`[TruecallerSSO] ${text}`);
      }
    },
    [showDebug]
  );

  const notifyFailure = useCallback(
    (payload) => {
      if (onError) onError(payload);
      if (onFailure) onFailure(payload);
    },
    [onError, onFailure]
  );

  const cleanPhoneNumber = (phoneNumber) => {
    if (!phoneNumber) return null;
    let cleanedNumber = phoneNumber.replace(/^\+91/, "");
    cleanedNumber = cleanedNumber.replace(/^\+/, "").replace(/\s/g, "");
    if (cleanedNumber.startsWith("91") && cleanedNumber.length > 10) {
      cleanedNumber = cleanedNumber.substring(2);
    }
    return cleanedNumber;
  };

  

  const integrateAuthAndStore = useCallback(
    async (tcData, nonce) => {
      try {
        const user = tcData?.message?.user || {};
        const apiCreds = tcData?.message?.api_credentials || {};
        const tcUser = tcData?.message?.tc || {};
        const email = user.email || null;
        const phoneNumber =
          user.phoneNumber || user.phone_number || user.phoneno || tcUser.phoneno || null;
        const displayName =
          user.full_name || user.name || user.displayName || user.fullName || tcUser.name || "User";

        // 1) Try ERPNext auth with provider truecaller (no localStorage writes)
        try {
          await fetch("/api/erpnext/auth", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email,
              phoneNumber,
              authProvider: "truecaller",
            }),
          });
        } catch (e) {
          // Ignore network errors, still attempt Firestore write
        }

        // 2) Best-effort Firestore storage into a dedicated collection
        try {
          const cleanedPhone = cleanPhoneNumber(phoneNumber || "");
          const docId = cleanedPhone || `req_${nonce}`;
          const record = {
            requestId: nonce,
            provider: "truecaller",
            displayName,
            email,
            phoneNumber: cleanedPhone || null,
            originalPhoneNumber: phoneNumber || null,
            apiCredentials: apiCreds || null,
            tcRaw: tcData,
            roleName: user.roleName || user.role || "Viewer",
            roleNames: user.roleNames || (user.role ? [user.role] : ["Viewer"]),
            createdAt: new Date().toISOString(),
            lastUpdatedAt: new Date().toISOString(),
          };
          await setDoc(doc(db, "users_truecaller", docId), record, { merge: true });

          // 3) Mirror into main 'users' collection under a namespaced doc id to avoid UID collisions
          const mainUserDocId = `tc_${docId}`;
          const usersRecord = {
            uid: mainUserDocId,
            email: email || null,
            phoneNumber: cleanedPhone || null,
            originalPhoneNumber: phoneNumber || null,
            displayName,
            photoURL: null,
            role: user.role || user.roleName || "Viewer",
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
            customProperties: {
              provider: "truecaller",
              authMethod: "truecaller",
              source: "truecaller_sso",
              requestId: nonce,
            },
          };
          await setDoc(doc(db, "users", mainUserDocId), usersRecord, { merge: true });
        } catch (fireErr) {
          // eslint-disable-next-line no-console
          console.warn("Failed to write Truecaller user to Firestore:", fireErr);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Auth integration failed:", err);
      }
    },
    [db]
  );

  const fetchResponseFromBackend = useCallback(
    async (nonce) => {
      if (!apiUrlState) {
        setMessage("Missing API URL");
        return;
      }
      if (isPollingRef.current) return;
      isPollingRef.current = true;
      try {
        if (showDebug) {
          setDebugPayload({
            phase: "polling",
            requestId: nonce,
            attempt: retryCountRef.current + 1,
            endpoint: `${apiUrlState}/api/method/truecaller`,
          });
        }
        const res = await fetch(`${apiUrlState}/api/method/truecaller`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId: nonce }),
        });
        const data = await res.json().catch(() => ({}));

        const status = data?.message?.status;
        log(`Backend status: ${status || "unknown"}`);

        if (showDebug) {
          setDebugPayload({
            phase: "response",
            requestId: nonce,
            attempt: retryCountRef.current + 1,
            status: status || "unknown",
            data,
          });
        }

        switch (status) {
          case "success": {
            setMessage("Verification successful");
            setIsLoading(false);
            retryCountRef.current = 0;
            // Minimal client-side session mirror as requested
            try {
              const msg = data?.message || {};
              const user = msg.user || {};
              const tcUser = msg.tc || {};
              const email = user.email || "";
              const rawPhone =
                user.phoneno || user.phoneNumber || user.phone_number || tcUser.phoneno || "";
              const displayName =
                user.full_name || user.name || tcUser.name || "User";
              const cleanedPhone = cleanPhoneNumber(rawPhone) || "";
              localStorage.setItem("userEmail", email);
              localStorage.setItem("userPhoneNumber", cleanedPhone);
              localStorage.setItem("userDisplayName", displayName);
              localStorage.setItem(
                "userAvatar",
                "data:image/svg+xml;base64,CiAgICA8c3ZnIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgogICAgICA8Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIyMCIgZmlsbD0iIzgyRTBBQSIvPgogICAgICA8dGV4dCB4PSIyMCIgeT0iMjYiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNiIgZm9udC13ZWlnaHQ9ImJvbGQiIAogICAgICAgICAgICB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSJ3aGl0ZSI+QjwvdGV4dD4KICAgIDwvc3ZnPgogIA=="
              );
            } catch (_) {
              // ignore client storage errors
            }
            if (onSuccess) onSuccess({ response: data });
            if (enableAuthIntegration) {
              await integrateAuthAndStore(data, nonce);
            }
            if (redirectOnSuccess) {
              try {
                if (router && router.replace) {
                  router.replace(redirectPath);
                } else if (typeof window !== "undefined") {
                  window.location.assign(redirectPath);
                }
              } catch (navErr) {
                // eslint-disable-next-line no-console
                console.warn("Navigation failed:", navErr);
              }
            }
            break;
          }
          case "user_not_found": {
            // Grace period: treat as transient early on to avoid premature failure
            const attempts = retryCountRef.current + 1;
            const elapsedMs = pollStartTimeRef.current ? Date.now() - pollStartTimeRef.current : 0;
            const withinGrace = attempts <= 5 || elapsedMs < 15000; // up to 5 tries or 15s
            if (withinGrace) {
              setMessage("Waiting for Truecaller response...");
              retryCountRef.current += 1;
              setTimeout(() => {
                isPollingRef.current = false;
                fetchResponseFromBackend(nonce);
              }, 2000);
            } else {
              setMessage("User not found");
              setIsLoading(false);
              retryCountRef.current = 0;
              notifyFailure({ code: "user_not_found", data });
            }
            break;
          }
          case "user_rejected": {
            setMessage("User rejected Truecaller");
            setIsLoading(false);
            retryCountRef.current = 0;
            notifyFailure({ code: "user_rejected", data });
            break;
          }
          default: {
            // Keep polling
            retryCountRef.current += 1;
            const count = retryCountRef.current;
            if (count <= 100) {
              setTimeout(() => {
                isPollingRef.current = false;
                fetchResponseFromBackend(nonce);
              }, 2000);
            } else {
              setMessage("Timed out waiting for verification");
              setIsLoading(false);
              retryCountRef.current = 0;
              notifyFailure({ code: "timeout", data });
            }
            break;
          }
        }
      } catch (err) {
        log(`Backend error: ${err?.message || err}`);
        if (showDebug) {
          setDebugPayload({
            phase: "error",
            requestId: nonce,
            attempt: retryCountRef.current + 1,
            message: err?.message || String(err),
          });
        }
        retryCountRef.current += 1;
        const count = retryCountRef.current;
        if (count <= 300) {
          setTimeout(() => {
            isPollingRef.current = false;
            fetchResponseFromBackend(nonce);
          }, 1000);
        } else {
          setMessage("Error contacting backend");
          setIsLoading(false);
          retryCountRef.current = 0;
          notifyFailure({ code: "network_error", error: err });
        }
      } finally {
        // Allow next poll iteration
        setTimeout(() => {
          isPollingRef.current = false;
        }, 10);
      }
    },
    [apiUrlState, log, notifyFailure, onSuccess]
  );

  const startTruecallerFlow = useCallback(() => {
    if (!partnerKey) {
      setMessage("Missing partner key");
      return;
    }
    if (!apiUrlState) {
      setMessage("Missing API URL");
      return;
    }

    setIsLoading(true);
    setMessage("Loading...");
    retryCountRef.current = 0;

    const nonce = generateUuidv4();
    setRequestId(nonce);
    log(`Generated request ID: ${nonce}`);
    pollStartTimeRef.current = Date.now();

    const url =
      `truecallersdk://truesdk/web_verify?type=btmsheet` +
      `&requestNonce=${encodeURIComponent(nonce)}` +
      `&partnerKey=${encodeURIComponent(partnerKey)}` +
      `&partnerName=${encodeURIComponent(partnerName)}` +
      `&lang=${encodeURIComponent(lang)}` +
      `&privacyUrl=${encodedPrivacyUrl}` +
      `&termsUrl=${encodedTermsUrl}` +
      `&loginPrefix=${encodeURIComponent(loginPrefix)}` +
      `&loginSuffix=${encodeURIComponent(loginSuffix)}` +
      `&ctaPrefix=${encodeURIComponent(ctaPrefix)}` +
      `&ctaColor=${encodeURIComponent(ctaColor)}` +
      `&ctaTextColor=${encodeURIComponent(ctaTextColor)}` +
      `&btnShape=${encodeURIComponent(btnShape)}` +
      `&skipOption=${encodeURIComponent(skipOption)}` +
      `&ttl=${encodeURIComponent(String(ttl))}`;

    // Kick off the Truecaller deep link
    window.location.href = url;

    if (showDebug) {
      setDebugPayload({
        phase: "start",
        requestId: nonce,
        deepLink: url,
      });
    }

    // If focus remains, app likely isn't installed
    setTimeout(() => {
      if (document.hasFocus()) {
        setMessage("Truecaller app not present on this device");
        setIsLoading(false);
      } else {
        setMessage("");
        // Delay first poll a bit longer to avoid premature 'user_not_found'
        setTimeout(() => fetchResponseFromBackend(nonce), 1200);
      }
    }, 600);
  }, [
    btnShape,
    ctaColor,
    ctaPrefix,
    ctaTextColor,
    encodedPrivacyUrl,
    encodedTermsUrl,
    fetchResponseFromBackend,
    lang,
    loginPrefix,
    loginSuffix,
    partnerKey,
    partnerName,
    skipOption,
    ttl,
    apiUrlState,
    log,
  ]);

  return (
    <div className={className} style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <button
        type="button"
        onClick={startTruecallerFlow}
        disabled={isLoading}
        aria-busy={isLoading}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: fullWidth ? "100%" : undefined,
          minWidth: 220,
          padding: "14px 22px",
          fontSize: 16,
          fontWeight: 600,
          background: isLoading
            ? ctaColor
            : `linear-gradient(135deg, ${ctaColor}, #ff7b55)`,
          color: ctaTextColor,
          border: "none",
          borderRadius: btnShape === "round" ? 999 : 10,
          boxShadow: "0 6px 14px rgba(0,0,0,0.12)",
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "transform 0.08s ease, box-shadow 0.2s ease, opacity 0.2s ease",
          opacity: isLoading ? 0.8 : 1,
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = "translateY(1px)";
          e.currentTarget.style.boxShadow = "0 4px 10px rgba(0,0,0,0.12)";
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 6px 14px rgba(0,0,0,0.12)";
        }}
      >
        {isLoading ? (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                width: 16,
                height: 16,
                border: `2px solid ${ctaTextColor}`,
                borderTopColor: "transparent",
                borderRadius: "50%",
                display: "inline-block",
                animation: "tc-spin 0.8s linear infinite",
              }}
            />
            Processing...
          </span>
        ) : (
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" fill="white" opacity="0.18" />
              <path d="M8 12.5l2.5 2.5L16 9" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {buttonText}
          </span>
        )}
      </button>

      {showStatus && message ? (
        <div style={{ marginTop: 12, fontSize: 14, color: "#333", textAlign: "center" }}>{message}</div>
      ) : null}

      {showRequestId && requestId ? (
        <div style={{ marginTop: 8, fontSize: 12, color: "#666" }}>Req ID: {requestId}</div>
      ) : null}

      {showDebug && debugPayload ? (
        <div style={{
          marginTop: 12,
          width: "100%",
          maxWidth: 560,
          background: "#f6f8fa",
          border: "1px solid #e1e4e8",
          borderRadius: 8,
          padding: 12,
          color: "#24292e",
          fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, \"Liberation Mono\", \"Courier New\", monospace",
          fontSize: 12,
          overflowX: "auto",
        }}>
          <div style={{ marginBottom: 8, fontWeight: 600 }}>Debug payload</div>
          <pre style={{ margin: 0, whiteSpace: "pre-wrap" }}>
            {JSON.stringify(debugPayload, null, 2)}
          </pre>
        </div>
      ) : null}

      <style>{`
        @keyframes tc-spin { from { transform: rotate(0deg);} to { transform: rotate(360deg);} }
      `}</style>
    </div>
  );
};

// Export dynamically to avoid SSR issues with window/crypto
export default dynamic(() => Promise.resolve(TruecallerComponent), {
  ssr: false,
});

