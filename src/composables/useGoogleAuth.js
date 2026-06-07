const GSI_SCRIPT_URL = 'https://accounts.google.com/gsi/client';

let scriptLoaded = false;
let scriptLoading = null;

function loadGsiScript() {
  if (scriptLoaded) return Promise.resolve();
  if (scriptLoading) return scriptLoading;

  scriptLoading = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = GSI_SCRIPT_URL;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      resolve();
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return scriptLoading;
}

export function useGoogleAuth() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  async function signInWithGoogle() {
    if (!clientId) {
      return {
        name: 'Google User',
        email: 'user@gmail.com',
        picture: null,
        demo: true
      };
    }

    await loadGsiScript();

    return new Promise((resolve, reject) => {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'openid email profile',
        callback: async (tokenResponse) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error));
            return;
          }

          try {
            const res = await fetch(
              `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${tokenResponse.access_token}`
            );
            if (!res.ok) throw new Error('Failed to fetch Google profile');
            const data = await res.json();
            resolve({
              name: data.name,
              email: data.email,
              picture: data.picture
            });
          } catch (err) {
            reject(err);
          }
        }
      });

      client.requestAccessToken();
    });
  }

  return {
    signInWithGoogle,
    hasClientId: !!clientId
  };
}
