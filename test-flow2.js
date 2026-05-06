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

  let resA = await request('/auth/register', 'POST', { username: userA, email: `${userA}@example.com`, password: 'password123' });
  let resB = await request('/auth/register', 'POST', { username: userB, email: `${userB}@example.com`, password: 'password123' });
  
  let loginA = await request('/auth/login', 'POST', { email: `${userA}@example.com`, password: 'password123' });
  let cookieA = extractCookie(loginA);
  
  let loginB = await request('/auth/login', 'POST', { email: `${userB}@example.com`, password: 'password123' });
  let cookieB = extractCookie(loginB);

  let workspace = await request('/workspaces', 'POST', { name: 'Workspace ' + uid, color: '#ff0000' }, cookieA);
  let wsId = workspace.body?.workspace?._id || workspace.body?.data?._id || workspace.body?._id;
  
  await request(`/workspaces/${wsId}/invite-member`, 'POST', { username: userB, message: 'Join my workspace!' }, cookieA);
  let notifs = await request(`/users/notifications`, 'GET', null, cookieB);
  if (notifs.body?.data && notifs.body.data.length > 0) {
    let notifId = notifs.body.data[0]._id;
    await request(`/workspaces/invitations/${notifId}/accept`, 'POST', null, cookieB);
  }

  // Find User B's ID
  let userBId = resB.body?.user?._id || resB.body?.user?.id;
  if (!userBId) {
     let uBInfo = await request('/auth/me', 'GET', null, cookieB);
     userBId = uBInfo.body?.user?._id || uBInfo.body?.user?.id;
  }
  
  console.log('--- User A Creating Project ---');
  let project = await request(`/projects/${wsId}/create-project`, 'POST', {
    title: 'Project Alpha',
    description: 'First project',
    status: 'Planning',
    startDate: new Date().toISOString(),
    members: [{ user: userBId, role: 'contributor' }]
  }, cookieA);
  console.log("Project Create:", project.status, project.body);

  let projectId = project.body?.project?._id || project.body?._id || project.body?.data?._id;
  
  if (projectId) {
    console.log('--- User A Creating Task assigned to User B ---');
    let task = await request(`/tasks/${projectId}/create-task`, 'POST', {
      title: 'First Task',
      description: 'Do this task',
      status: 'To Do',
      priority: 'High',
      dueDate: new Date().toISOString(),
      assignees: [userBId]
    }, cookieA);
    console.log("Task Create:", task.status, task.body);

    if (task.body?._id || task.body?.data?._id || task.body?.task?._id) {
        let taskId = task.body?.task?._id || task.body?._id || task.body?.data?._id;
        console.log('--- User B Checking Task ---');
        let taskGet = await request(`/tasks/${taskId}`, 'GET', null, cookieB);
        console.log("User B Get Task:", taskGet.status, taskGet.body?.title || taskGet.body);
    }
  }
}
run();
