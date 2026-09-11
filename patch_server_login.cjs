const fs = require('fs');
let code = fs.readFileSync('server.ts', 'utf8');

const loginTarget1 = `            lizCoins = user?.lizCoins || 0;
            activeDecoration = user?.activeDecoration || null;
            ownedDecorations = user?.ownedDecorations || [];
            elo = user?.elo || 0;
            uid = user?.uid || "";
            profileLikes = user?.profileLikes || 0;
            incognito = !!user?.incognito;
          }
        } catch(e) {}
      }

      if (username !== "Elizabeth" && username !== "Axiss") {`;

const replacement1 = `            lizCoins = user?.lizCoins || 0;
            activeDecoration = user?.activeDecoration || null;
            ownedDecorations = user?.ownedDecorations || [];
            elo = user?.elo || 0;
            uid = user?.uid || "";
            profileLikes = user?.profileLikes || 0;
            incognito = !!user?.incognito;
            var nameColor = user?.nameColor;
            var nameNeon = user?.nameNeon;
            var nameRainbow = user?.nameRainbow;
            var nameNeonColor1 = user?.nameNeonColor1;
            var nameNeonColor2 = user?.nameNeonColor2;
            var nameFont = user?.nameFont;
            var chatFont = user?.chatFont;
            var chatColorStyle = user?.chatColorStyle;
            var bgImage = user?.bgImage;
            var bubbleColor = user?.bubbleColor;
            var bubbleBorder = user?.bubbleBorder;
            var bubbleShape = user?.bubbleShape;
            var bubbleTexture = user?.bubbleTexture;
          }
        } catch(e) {}
      }

      if (username !== "Elizabeth" && username !== "Axiss") {`;

const activeUserTarget1 = `            is_friends_public: isFriendsPublic,
            friends_list: friendsList,
            blocked_list: blockedList,
            awards,
            lizCoins,
            activeDecoration,
            ownedDecorations,
            elo,
            uid,
            profileLikes,
            incognito
          };`;

const activeUserReplacement1 = `            is_friends_public: isFriendsPublic,
            friends_list: friendsList,
            blocked_list: blockedList,
            awards,
            lizCoins,
            activeDecoration,
            ownedDecorations,
            elo,
            uid,
            profileLikes,
            incognito,
            nameColor,
            nameNeon,
            nameRainbow,
            nameNeonColor1,
            nameNeonColor2,
            nameFont,
            chatFont,
            chatColorStyle,
            bgImage,
            bubbleColor,
            bubbleBorder,
            bubbleShape,
            bubbleTexture
          };`;

const loginTarget2 = `            lizCoins = user?.lizCoins || 0;
            activeDecoration = user?.activeDecoration || null;
            ownedDecorations = user?.ownedDecorations || [];
            elo = user?.elo || 0;
            uid = user?.uid || "";
            profileLikes = user?.profileLikes || 0;
            incognito = !!user?.incognito;
            if (!uid) {`;

const replacement2 = `            lizCoins = user?.lizCoins || 0;
            activeDecoration = user?.activeDecoration || null;
            ownedDecorations = user?.ownedDecorations || [];
            elo = user?.elo || 0;
            uid = user?.uid || "";
            profileLikes = user?.profileLikes || 0;
            incognito = !!user?.incognito;
            var nameColor2 = user?.nameColor;
            var nameNeon2 = user?.nameNeon;
            var nameRainbow2 = user?.nameRainbow;
            var nameNeonColor12 = user?.nameNeonColor1;
            var nameNeonColor22 = user?.nameNeonColor2;
            var nameFont2 = user?.nameFont;
            var chatFont2 = user?.chatFont;
            var chatColorStyle2 = user?.chatColorStyle;
            var bgImage2 = user?.bgImage;
            var bubbleColor2 = user?.bubbleColor;
            var bubbleBorder2 = user?.bubbleBorder;
            var bubbleShape2 = user?.bubbleShape;
            var bubbleTexture2 = user?.bubbleTexture;
            if (!uid) {`;

const activeUserTarget2 = `        is_friends_public: isFriendsPublic,
        friends_list: friendsList,
        blocked_list: blockedList,
        awards,
        lizCoins,
        activeDecoration,
        ownedDecorations,
        elo,
        uid,
        profileLikes,
        incognito
      };`;

const activeUserReplacement2 = `        is_friends_public: isFriendsPublic,
        friends_list: friendsList,
        blocked_list: blockedList,
        awards,
        lizCoins,
        activeDecoration,
        ownedDecorations,
        elo,
        uid,
        profileLikes,
        incognito,
        nameColor: typeof nameColor2 !== 'undefined' ? nameColor2 : undefined,
        nameNeon: typeof nameNeon2 !== 'undefined' ? nameNeon2 : undefined,
        nameRainbow: typeof nameRainbow2 !== 'undefined' ? nameRainbow2 : undefined,
        nameNeonColor1: typeof nameNeonColor12 !== 'undefined' ? nameNeonColor12 : undefined,
        nameNeonColor2: typeof nameNeonColor22 !== 'undefined' ? nameNeonColor22 : undefined,
        nameFont: typeof nameFont2 !== 'undefined' ? nameFont2 : undefined,
        chatFont: typeof chatFont2 !== 'undefined' ? chatFont2 : undefined,
        chatColorStyle: typeof chatColorStyle2 !== 'undefined' ? chatColorStyle2 : undefined,
        bgImage: typeof bgImage2 !== 'undefined' ? bgImage2 : undefined,
        bubbleColor: typeof bubbleColor2 !== 'undefined' ? bubbleColor2 : undefined,
        bubbleBorder: typeof bubbleBorder2 !== 'undefined' ? bubbleBorder2 : undefined,
        bubbleShape: typeof bubbleShape2 !== 'undefined' ? bubbleShape2 : undefined,
        bubbleTexture: typeof bubbleTexture2 !== 'undefined' ? bubbleTexture2 : undefined
      };`;

code = code.replace(loginTarget1, replacement1);
code = code.replace(activeUserTarget1, activeUserReplacement1);
code = code.replace(loginTarget2, replacement2);
code = code.replace(activeUserTarget2, activeUserReplacement2);

fs.writeFileSync('server.ts', code);
console.log("Patched server.ts login states");
