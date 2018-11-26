exports.handler = async (event, context) => {
  const response = {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin" : "*",
      "Access-Control-Allow-Credentials" : true
    },
    body: JSON.stringify({
      data: "Denne meldingen vises kun for personer med gyldig ID-Porten innlogging."
    }),
  };
  return response;
}