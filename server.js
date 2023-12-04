const { EventEmitter } = require("events");
const http = require("http");
const path = require("path");
const fs = require("fs");

let NewsLetter = new EventEmitter();

http.createServer((req, res) => {
    const { url, method } = req;
    const chunks = [];

    req
        .on("data", (chunk) => {
            chunks.push(chunk);
        })
        .on("end", () => {
            if (url === "/newsletter_signup" && method === "POST") {
                const body = JSON.parse(Buffer.concat(chunks).toString());

                const newContact = `${body.name},${body.email}\n`;

                if (body.name === undefined || body.email === undefined || Object.keys(body).length != 2){
                    //prevent the file from being overwritten if fields are undefined, or if the incorrect number of fields are sent
                    res.write("Invalid data");
                }
                else {
                    NewsLetter.emit("signup", newContact);
                    res.write("Successfully signed new contact");
                }
                res.end();
            }
            else {
                res.statusCode = 404;
                res.write("Not a valid endpoint");
                res.end();
            }
        });

}).listen(3000, () => console.log("Server listening on port 3000"));

NewsLetter.on("signup", (newContact) => {
    fs.appendFile("newsletter.csv", newContact, (err) => {
        if (err) {
            NewsLetter.emit("error", err);
            return;
        }
        console.log("File updated successfully");
        res.write("File updated successfully");
    });
})

NewsLetter.on("error", (err) => {
    console.log(err);
});