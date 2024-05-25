const express = require('express');
const multer = require('multer');
const ffmpeg = require('fluent-ffmpeg');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const upload = multer({
    dest: 'uploads/'
});

app.use(cors());

app.post('/api/convert-videos-to-audio', upload.array('videos'), async (req, res) => {
    if (!req.files || req.files.length === 0) {
        return res.status(400).send('No video files uploaded.');
    }

    const audioFiles = [];
    const convertPromises = req.files.map((file) => {
        return new Promise((resolve, reject) => {
            const videoPath = file.path;
            const originalName = path.parse(file.originalname).name;
            const audioPath = path.join('uploads', `${originalName}.mp3`);

            ffmpeg(videoPath)
                .output(audioPath)
                .on('end', () => {
                    audioFiles.push({
                        path: audioPath,
                        name: `${originalName}.mp3`
                    });
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Error converting video to audio:', err);
                    reject(err);
                })
                .run();
        });
    });

    try {
        await Promise.all(convertPromises);

        const zipPath = path.join('uploads', 'converted_audios.zip');
        const output = fs.createWriteStream(zipPath);
        const archive = archiver('zip', {
            zlib: {
                level: 9
            }
        });

        output.on('close', () => {
            console.log(`ZIP file created with size ${archive.pointer()} bytes`);
            res.download(zipPath, 'converted_audios.zip', (err) => {
                if (err) {
                    console.error('Error sending zip file:', err);
                    res.status(500).send('Error creating ZIP file.');
                }

                // Eliminar archivos temporales después de enviar el ZIP
                req.files.forEach(file => fs.unlinkSync(file.path));
                audioFiles.forEach(file => fs.unlinkSync(file.path));
                fs.unlinkSync(zipPath);
            });
        });

        archive.on('error', (err) => {
            console.error('Error creating ZIP file:', err);
            res.status(500).send('Error creating ZIP file.');
        });

        archive.pipe(output);
        audioFiles.forEach((file) => {
            archive.file(file.path, {
                name: file.name
            });
        });
        await archive.finalize();

    } catch (error) {
        console.error('Error processing files:', error);
        res.status(500).send('Error processing files.');
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});