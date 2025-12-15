import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          {/* Critical connection hints - prioritized */}
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="dns-prefetch" href="//img.plasmic.app" />
          <link rel="dns-prefetch" href="//img.plasmiccdn.com" />
          <link rel="dns-prefetch" href="//images.plasmic.app" />
          
          {/* Performance: Preconnect to Firebase if used */}
          <link rel="preconnect" href="https://firebase.googleapis.com" />
          <link rel="preconnect" href="https://firestore.googleapis.com" />
          
          {/* Resource hints for faster loading */}
          <link rel="prefetch" href="/api/hello" />

          {/* Self-hosted variable fonts preloads with font-display swap */}
          <link
            rel="preload"
            as="font"
            href="/fonts/GeistVF.woff"
            type="font/woff"
            crossOrigin="anonymous"
          />
          <link
            rel="preload"
            as="font"
            href="/fonts/GeistMonoVF.woff"
            type="font/woff"
            crossOrigin="anonymous"
          />
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @font-face {
                  font-family: 'GeistVF';
                  src: url('/fonts/GeistVF.woff') format('woff');
                  font-display: swap;
                  font-weight: 100 900;
                }
                @font-face {
                  font-family: 'GeistMonoVF';
                  src: url('/fonts/GeistMonoVF.woff') format('woff');
                  font-display: swap;
                  font-weight: 100 900;
                }
              `,
            }}
          />

          {/* Preload loading GIF for instant display */}
          <link
            rel="preload"
            as="image"
            href="/elbrit one logo.gif"
          />

          {/* Minimize layout shift */}
          <meta name="theme-color" content="#ffffff" />

          {/* PWA manifest and icons */}
          <link rel="manifest" href="/manifest.webmanifest" />
          <meta name="application-name" content="Elbrit One" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
          <link rel="apple-touch-icon" href="/logo.svg" />
          <link rel="icon" type="image/svg+xml" href="/logo.svg" />
          <link rel="icon" type="image/x-icon" href="/favicon.ico" />

          {/* OneSignal Push Notifications */}
          <script src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js" defer></script>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.OneSignalDeferred = window.OneSignalDeferred || [];
                OneSignalDeferred.push(async function(OneSignal) {
                  await OneSignal.init({
                    appId: "ae84e191-00f5-445c-8e43-173709b8a553",
                    allowLocalhostAsSecureOrigin: true
                  });
                  // Expose OneSignal to window for global access
                  window.OneSignal = OneSignal;
                  console.log('✅ OneSignal initialized and exposed to window');
                });
              `,
            }}
          />
        </Head>
        <body>
          {/* Loading screen with animated GIF */}
          <div id="app-loading-screen">
            <div className="loading-container">
              <img 
                src="/elbrit one logo.gif" 
                alt="Loading..." 
                className="loading-gif"
              />
            </div>
          </div>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;


