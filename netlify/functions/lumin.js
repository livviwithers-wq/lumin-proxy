exports.handler = async function(event) {
  var CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, x-lumin-token'
  };
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' };
  }
  var token = event.headers['x-lumin-token'];
  var p = event.queryStringParameters || {};
  if (!token) {
    return { statusCode: 401, headers: Object.assign({}, CORS, {'Content-Type': 'application/json'}), body: JSON.stringify({error: 'Missing x-lumin-token'}) };
  }
  if (!p.endpoint || ['users','wellness'].indexOf(p.endpoint) === -1) {
    return { statusCode: 400, headers: Object.assign({}, CORS, {'Content-Type': 'application/json'}), body: JSON.stringify({error: 'Use ?endpoint=users or ?endpoint=wellness'}) };
  }
  var base = 'https://app.luminsports.com/aufb-276562/thirdpartyapi/v1';
  var url = p.endpoint === 'wellness'
    ? base + '/wellness?date=' + (p.date || new Date().toISOString().split('T')[0])
    : base + '/users';
  try {
    var r = await fetch(url, {
      headers: { 'Authorization': 'Bearer ' + token, 'Accept': 'application/json' }
    });
    var d = await r.json();
    return {
      statusCode: r.status,
      headers: Object.assign({}, CORS, {'Content-Type': 'application/json', 'Cache-Control': 'no-store'}),
      body: JSON.stringify(d)
    };
  } catch(e) {
    return {
      statusCode: 502,
      headers: Object.assign({}, CORS, {'Content-Type': 'application/json'}),
      body: JSON.stringify({error: 'Lumin unreachable', detail: e.message})
    };
  }
};
`