const http = require('http');

async function request(path, method, body, cookie) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : null;
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api-v1' + path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    if (cookie) {
      options.headers['Cookie'] = cookie;
    }
    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(data);
    }
    const req = http.request(options, (res) => {
      let resBody = '';
      res.on('data', chunk => resBody += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, body: resBody ? JSON.parse(resBody) : null });
        } catch(e) {
          resolve({ status: res.statusCode, headers: res.headers, body: resBody });
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(data);
    req.end();
  });
}

function extractCookie(res) {
  if (!res.headers['set-cookie']) return null;
  return res.headers['set-cookie'][0].split(';')[0];
}

async function run() {
  let uid = Date.now().toString().slice(-6);
  let userA = `usera_${uid}`;
  let userB = `userb_${uid}`;

  console.log('--- Registering User A ---');
  let resA = await request('/auth/register', 'POST', { username: userA, email: `${userA}@example.com`, password: 'password123' });
  console.log(resA.status, resA.body?.message);
  
  console.log('--- Registering User B ---');
  let resB = await request('/auth/register', 'POST', { username: userB, email: `${userB}@example.com`, password: 'password123' });
  console.log(resB.status, resB.body?.message);
  
  console.log('--- Logging in User A ---');
  let loginA = await request('/auth/login', 'POST', { email: `${userA}@example.com`, password: 'password123' });
  let cookieA = extractCookie(loginA);
  console.log("Login A:", loginA.status, cookieA ? "Cookie Set" : "No Cookie");
  
  console.log('--- Logging in User B ---');
  let loginB = await request('/auth/login', 'POST', { email: `${userB}@example.com`, password: 'password123' });
  let cookieB = extractCookie(loginB);
  console.log("Login B:", loginB.status, cookieB ? "Cookie Set" : "No Cookie");

  if(!cookieA || !cookieB) return console.log('Failed to login users');

  console.log('--- User A Creating Workspace ---');
  let workspace = await request('/workspaces', 'POST', { name: 'Workspace ' + uid, color: '#ff0000' }, cookieA);
  console.log("Workspace Create:", workspace.status, workspace.body?.message || workspace.body);
  
  let wsId = workspace.body?.workspace?._id || workspace.body?.data?._id || workspace.body?._id;
  if (!wsId) return console.log('Failed to create workspace. Body:', workspace.body);

  console.log('--- User A Searching for User B ---');
  let searchRes = await request(`/users/search?username=${userB}`, 'GET', null, cookieA);
  console.log("Search:", searchRes.status, searchRes.body?.data?.length, "found");
  
  console.log('--- User A Inviting User B ---');
  let invite = await request(`/workspaces/${wsId}/invite-member`, 'POST', { username: userB, message: 'Join my workspace!' }, cookieA);
  console.log("Invite:", invite.status, invite.body);

  console.log('--- User B Checking Notifications ---');
  let notifs = await request(`/users/notifications`, 'GET', null, cookieB);
  console.log("Notifs:", notifs.status, notifs.body?.data?.length, "notifications");

  if (notifs.body?.data && notifs.body.data.length > 0) {
    let notifId = notifs.body.data[0]._id;
    console.log('--- User B Accepting Invite ---');
    let accept = await request(`/workspaces/invitations/${notifId}/accept`, 'POST', null, cookieB);
    console.log("Accept:", accept.status, accept.body);
  }

  console.log('--- Checking User B Workspaces ---');
  let userBWorkspaces = await request('/workspaces', 'GET', null, cookieB);
  console.log("User B Workspaces:", userBWorkspaces.status, userBWorkspaces.body?.data?.length || userBWorkspaces.body?.length);
}
run();
