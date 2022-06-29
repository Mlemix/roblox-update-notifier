const schedule = require('node-schedule');
const fs = require("fs");
const axios = require("axios");

const callbacks = {
    /*
        Do whatever with the functions below. I currently have them post discord webhooks, you can make them do something else.
        data structure for updated: {
            previous, <- previous version
            current <- current version
        }
        data structure for newVersion: {
            version <- the pushed version
        }
    */
    updated: async (data) => {
        console.log("roblox updated! previous version:", data.previous, "current version:", data.current)

        axios.post("discord webhook url here", {
            "content": "", // can use this for an @everyone ping
            "embeds": [
              {
                "title": "ROBLOX Has Updated!",
                "description": `Previous version:\n\`\`\`\n${data.previous}\n\`\`\`\nCurrent version:\n\`\`\`\n${data.current}\n\`\`\``,
                "color": 5814783,
                "footer": {
                  "text": "Powered by Mlemix"
                },
                "timestamp": new Date()
              }
            ],
            "username": "Roblox Update Notifier",
            "avatar_url": "https://www.meme-arsenal.com/memes/ebbfacda15693a6865494d6b74c964a6.jpg",
            "attachments": []
        })
    },
    newVersion: async (data) => {
        console.log("new roblox version pushed!", data.version)

        axios.post("discord webhook url here", {
            "content": "", // can use this for an @everyone ping
            "embeds": [
              {
                "title": "New ROBLOX Version Pushed!",
                "description": `\`${data.version}\` has been pushed to the ROBLOX cdn and can now be downloaded [here](https://setup.roblox.com/${data.version}-RobloxApp.zip). **THIS VERSION IS NOT RELEASED YET!**`,
                "color": 5814783,
                "footer": {
                  "text": "Powered by Mlemix"
                },
                "timestamp": new Date()
              }
            ],
            "username": "Roblox Update Notifier",
            "avatar_url": "https://www.meme-arsenal.com/memes/ebbfacda15693a6865494d6b74c964a6.jpg",
            "attachments": []
        })
    }
}

let fileData = null
let versionFile = `${__dirname}\\versions.txt` // change this to the location of your version file
let tick = null
let checker = null
let checkForNext = true

const getVersion = (type) => {
    return new RegExp(`\\b${type}: [^\\s]+`, 'g').exec(fileData)[0].split(' ').at(-1)
}
const initUpdate = async (newVer) => {
    checkForNext = true
    checker.reschedule("*/7 * * * *") // update isnt too close, check less frequently
    const oldVer = getVersion("current")
    fileData = fileData.replace(new RegExp(oldVer, 'g'), newVer).replace(new RegExp(getVersion("previous"), 'g'), oldVer)
    fs.writeFileSync(versionFile, fileData)

    callbacks.updated && await callbacks.updated({
        previous: getVersion("previous"),
        current: getVersion("current")
    })
}
const initPush = async (ver) => {
    checkForNext = false
    checker.reschedule("*/2 * * * *") // update is close, check more frequently
    fileData = fileData.replace(new RegExp(getVersion("next"), 'g'), ver)
    fs.writeFileSync(versionFile, fileData)

    callbacks.newVersion && await callbacks.newVersion({
        version: ver
    })
}

tick = async () => {
    fileData = fs.readFileSync(versionFile, { encoding: "utf8" })

    const versionGet = await axios.get("http://setup.roblox.com/version")
    if (versionGet && versionGet.statusText == "OK" && versionGet.data != getVersion("current")) {
        await initUpdate(versionGet.data)
    }

    if (!checkForNext) return
    const versionLogGet = await axios.get("http://setup.roblox.com/DeployHistory.txt")
    if (versionLogGet && versionLogGet.statusText == "OK") {
        const lastVer = versionLogGet.data.match(/(\bNew WindowsPlayer [^\s]+)/g).at(-1).split(' ').at(-1)
        if (getVersion("current") != lastVer && getVersion("next") != lastVer) {
            await initPush(lastVer)
        }
    }
}
tick()
checker = schedule.scheduleJob("*/7 * * * *", tick);
