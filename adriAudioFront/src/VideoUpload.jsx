import React, { useState } from 'react';
import axios from 'axios';

function VideoUpload() {
    const [videoFiles, setVideoFiles] = useState([]);
    const [zipFile, setZipFile] = useState(null);

    const handleVideoChange = (event) => {
        setVideoFiles(event.target.files);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (videoFiles.length === 0) {
            alert('Please select video files to upload.');
            return;
        }

        const formData = new FormData();
        for (let i = 0; i < videoFiles.length; i++) {
            formData.append('videos', videoFiles[i]);
        }

        try {
            const response = await axios.post('http://localhost:3001/api/convert-videos-to-audio', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                responseType: 'blob' // Esperar una respuesta como Blob
            });

            // Crear un enlace de descarga para el archivo ZIP
            const zipBlob = new Blob([response.data], { type: 'application/zip' });
            const zipUrl = URL.createObjectURL(zipBlob);
            setZipFile(zipUrl);

        } catch (error) {
            console.error('Error uploading videos:', error);
            alert('Error uploading videos.');
        }
    };

    return (
        <div>
            <form onSubmit={handleSubmit}>
                <input type="file" accept="video/*" multiple onChange={handleVideoChange} />
                <button type="submit">Convert Videos to Audio</button>
            </form>
            {zipFile && (
                <div>
                    <h3>Converted Audio Files:</h3>
                    <a href={zipFile} download="converted_audios.zip">Download ZIP</a>
                </div>
            )}
        </div>
    );
}

export default VideoUpload;
