const fs = require("fs");
const apiKey = fs.readFileSync(__dirname + "/.imgbb-key").toString();
const ibb_upload = require("imgbb-uploader");
async function uploadImage(base64, name) {
    const output = await ibb_upload({
        apiKey,
        base64string:base64,
        name
    });
    console.log(await output, "output");
    return output;
}
module.exports = uploadImage;