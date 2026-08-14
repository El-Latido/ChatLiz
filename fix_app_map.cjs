const fs = require('fs');
let file = fs.readFileSync('src/App.tsx', 'utf8');

file = file.replace(
  /\{u\.awards && u\.awards\.map/g,
  "{Array.isArray(u.awards) && u.awards.map"
);

file = file.replace(
  /\{selectedUserModal\.awards && selectedUserModal\.awards\.map/g,
  "{Array.isArray(selectedUserModal.awards) && selectedUserModal.awards.map"
);

file = file.replace(
  /user\.friends_list\.map/g,
  "Array.isArray(user.friends_list) && user.friends_list.map"
);

file = file.replace(
  /\(\!user\.friends_list \|\| user\.friends_list\.length === 0\)/g,
  "(!Array.isArray(user.friends_list) || user.friends_list.length === 0)"
);

fs.writeFileSync('src/App.tsx', file);
