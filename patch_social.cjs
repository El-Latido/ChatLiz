const fs = require('fs');

let postCardCode = fs.readFileSync('src/components/social/PostCard.tsx', 'utf8');
postCardCode = postCardCode.replace(
  'export function PostCard({ post, currentUser }: PostCardProps) {',
  'export function PostCard({ post, currentUser, onUserClick }: PostCardProps & { onUserClick?: (username: string) => void }) {'
);

postCardCode = postCardCode.replace(
  '<h3 className="text-white font-bold text-sm cursor-pointer hover:underline">{post.username}</h3>',
  '<h3 onClick={() => onUserClick && onUserClick(post.username)} className="text-white font-bold text-sm cursor-pointer hover:underline">{post.username}</h3>'
);

postCardCode = postCardCode.replace(
  '<img src={post.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`} alt={post.username} className="w-10 h-10 rounded-full border border-[#D4AF37]/30 bg-black/50 object-cover cursor-pointer hover:opacity-80 transition-opacity" />',
  '<img onClick={() => onUserClick && onUserClick(post.username)} src={post.userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.username}`} alt={post.username} className="w-10 h-10 rounded-full border border-[#D4AF37]/30 bg-black/50 object-cover cursor-pointer hover:opacity-80 transition-opacity" />'
);

fs.writeFileSync('src/components/social/PostCard.tsx', postCardCode);

let feedCode = fs.readFileSync('src/components/social/SocialFeed.tsx', 'utf8');
feedCode = feedCode.replace(
  "import { CreatePostModal } from './CreatePostModal';",
  "import { CreatePostModal } from './CreatePostModal';\nimport { UserProfileModal } from './UserProfileModal';"
);

feedCode = feedCode.replace(
  'const [showCreateModal, setShowCreateModal] = useState(false);',
  'const [showCreateModal, setShowCreateModal] = useState(false);\n  const [selectedUser, setSelectedUser] = useState<string | null>(null);'
);

feedCode = feedCode.replace(
  '<PostCard key={post.id} post={post} currentUser={user} />',
  '<PostCard key={post.id} post={post} currentUser={user} onUserClick={(username) => setSelectedUser(username)} />'
);

feedCode = feedCode.replace(
  '{showCreateModal && (',
  '{selectedUser && (\n        <UserProfileModal username={selectedUser} currentUser={user} onClose={() => setSelectedUser(null)} />\n      )}\n      {showCreateModal && ('
);

fs.writeFileSync('src/components/social/SocialFeed.tsx', feedCode);
