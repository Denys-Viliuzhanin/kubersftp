

import express from 'express'
import {tmpdir} from 'os'
import {resolve} from 'path'
import {readdirSync, 
        existsSync, 
        mkdirSync, 
        createWriteStream, 
        createReadStream} 
        from 'fs'

const port = 8080

const path =  process.env.SFTP_PATH ? process.env.SFTP_PATH : tmpdir() + "/sftp";

if (!existsSync(path)) {
    mkdirSync(path)    
}

let app = express()


app.get("/files", function (req, res) {
    let files = readdirSync(path)
    res.send(JSON.stringify(files))
})

app.post("/file/:filename", function (req, res) {
    let filePath = resolve(path, req.params.filename)

    let writeStream = createWriteStream(filePath);

    writeStream.on('error', error => {
        res.status(500).send(error)
        res.end()
    })
    // After all the data is saved, respond with a simple html form so they can post more data
    writeStream.on('finish', function () {
        console.log(`File posted: ${filePath}`)
        res.status(200).end("OK")
    });

    req.pipe(writeStream)
})

app.listen(port, () => {
    console.log(`SFTP directory: ${path}`)
    console.log(`Publisher listening on port ${port}!`)
}); 
