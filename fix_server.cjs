const fs = require('fs');
let file = fs.readFileSync('server.ts', 'utf8');

const startMarker = `    socket.on("broadcast_profile_change", (data) => {
      if (activeUsers[data.username]) {
          activeUsers[data.username].profilePic = data.profilePic;
          activeUsers[data.username].statusMessage = data.statusMessage;
          io.emit("active_users", Object.values(activeUsers));
      }
    });`;

const searchEndMarker = `      callback({ success: true, username: currentUsername, profilePic: safeProfilePic, statusMessage: safeStatusMessage, countryLanguage: safeLanguage, is_friends_public: safeIsFriendsPublic });
    });`;

const startIndex = file.indexOf(startMarker) + startMarker.length;
const endIndex = file.indexOf(searchEndMarker, startIndex) + searchEndMarker.length;

if (startIndex > startMarker.length - 1 && endIndex > searchEndMarker.length) {
    const newFile = file.substring(0, startIndex) + "\n" + file.substring(endIndex);
    fs.writeFileSync('server.ts', newFile);
    console.log("Fixed server.ts!");
} else {
    console.log("Could not find markers.");
}
