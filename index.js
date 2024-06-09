const express = require("express");
const https = require("https");
const bodyParser = require("body-parser");
var cookieParser = require('cookie-parser');

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
})

app.post("/postAuthor", function (req, res) {
    var cookie;
    const authorReq = (req.body.author).toLowerCase().replace(" ", "-");
    if (authorReq == "") {
        url = "https://api.quotable.io/quotes/random";
    }
    else {
        url = "https://api.quotable.io/quotes/random?author=" + encodeURIComponent(authorReq);
    }
    res.cookie("quoteUrl", url);
    res.redirect("/quote")
});

app.get("/quote", function (req, res) {
    const url = req.cookies.quoteUrl;
    if(!url){
        res.redirect("/error");
    }
    res.set("Content-Type", "text/html");
    https.get(url, function (response) {
        let data = '';

        response.on("data", function (chunk) {
            data += chunk;
        });

        response.on("end", function () {
            try {
                let parsedData = {};
                if (data) {
                    parsedData = JSON.parse(data);
                }
                if (parsedData[0].author && parsedData[0].author.length > 0) {
                    const parsedData = JSON.parse(data);
                    const quoteData = {
                        cont: parsedData[0].content,
                        auth: parsedData[0].author
                    }
                    res.render("quote", { quoteData });
                }
                else {
                    res.write("<h2>No quotes found for the specified author.</h2>");
                }
            }
            catch (error) {
                res.write("<h2>Error parsing quote data.</h2>");
            }
            res.end();
        });
    }).on("error", function (e) {
        res.write("<h2>Error retrieving quote: " + e.message + "</h2>");
        res.end();
    });
})

app.get("*", function (req, res) {
    res.sendFile(__dirname + "/404.html")
})

app.listen(3000, function () {
    console.log("Listening at port 3000");
});