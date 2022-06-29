# roblox-update-notifier
logs ROBLOX's updates and new versions

This is meant to be ran in NodeJS, 24/7, using something like pm2.

NPM packages required: [node-schedule](https://www.npmjs.com/package/node-schedule) and [axios](https://www.npmjs.com/package/axios)

All you need to do is change the current version in versions.txt. It can be retrieved from https://setup.roblox.com/version , the rest will get filled in automatically.

example
```
previous: version-0000000000000000
current: version-cb81695a34b340de
next: version-0000000000000000
```

showcase:

![update message](https://cdn.discordapp.com/attachments/929016243619495967/991849015136243832/update-notifier-update.png)

![version push](https://cdn.discordapp.com/attachments/929016243619495967/991849035277271130/update-notifier-push.png)
