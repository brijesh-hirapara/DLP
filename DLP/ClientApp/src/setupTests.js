const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;
const localURL = process.env.REACT_APP_API_URL;
// Mock the request issued by the react app to get the client configuration parameters.
window.fetch = () => {
  return Promise.resolve({
    ok: true,
    json: () =>
      Promise.resolve({
        authority: localURL,
        client_id: "KGH",
        redirect_uri: `${localURL}/authentication/login-callback`,
        post_logout_redirect_uri:
          `${localURL}/authentication/logout-callback`,
        response_type: "id_token token",
        scope: "DLPAPI openid profile",
      }),
  });
};
