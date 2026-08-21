const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target1 = `              {/* Chat Content Wrapper */}
              <div className="flex-1 min-h-0 min-w-0 flex flex-col relative z-0">
                  <div className="hidden"></div>

                <>`;
const replace1 = `              {/* Chat Content Wrapper */}
              <div className="flex-1 min-h-0 min-w-0 flex flex-col relative z-0">
                  <div className="hidden"></div>

                  {activeChat === 'lizgram' ? (
                     <SocialFeed user={user} />
                  ) : (
                <>`;

const target2 = `                      </div>
                  </div>
              </div>
              </>
              </div>
          </main>`;
const replace2 = `                      </div>
                  </div>
              </div>
              </>
                  )}
              </div>
          </main>`;

code = code.replace(target1, replace1);
code = code.replace(target2, replace2);
fs.writeFileSync('src/App.tsx', code);
