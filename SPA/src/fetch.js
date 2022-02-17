export const callApiWithToken = async (accessToken, apiEndpoint) => {
  const headers = new Headers();
  const bearer = `Bearer ${accessToken}`;

  // View JWT issued by AAD: https://jwt.ms
  console.log('accessToken:', accessToken);

  headers.append('Authorization', bearer);

  const options = {
    method: 'GET',
    headers: headers,
  };

  return fetch(apiEndpoint, options)
    .then((response) => response.json())
    .catch((error) => console.log(error));
};
