console.log(faceapi);

const run = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById('video');
    video.srcObject = stream;
    video.play();

    // Load Models
    await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri('./models'),
        faceapi.nets.tinyFaceDetector.loadFromUri('./models'),
        faceapi.nets.faceLandmark68Net.loadFromUri('./models'),
        faceapi.nets.faceRecognitionNet.loadFromUri('./models'),
        faceapi.nets.faceExpressionNet.loadFromUri('./models'),
        faceapi.nets.ageGenderNet.loadFromUri('./models'),
    ]);

    const canvas = document.getElementById('canvas');
    canvas.style.left = video.offsetLeft + 'px';
    canvas.style.top = video.offsetTop + 'px';
    canvas.height = video.height;
    canvas.width = video.width;

    // Facial Detection
    setInterval(async () => {
        const faceAIData = await faceapi
            .detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors()
            .withFaceExpressions()
            .withAgeAndGender();

        canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);

        const displaySize = { width: video.width, height: video.height };
        faceapi.matchDimensions(canvas, displaySize);
        const resizedDetections = faceapi.resizeResults(faceAIData, displaySize);

        // Draw detections, landmarks, and expressions
        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

        if (resizedDetections.length > 0) {
            const expressions = resizedDetections[0].expressions;

            // Find the emotion with the highest confidence
            const dominantEmotion = Object.keys(expressions).reduce((a, b) =>
                expressions[a] > expressions[b] ? a : b
            );

            console.log("Detected Emotion:", dominantEmotion);

            // Save emotion to localStorage or a variable
            localStorage.setItem("currentEmotion", dominantEmotion);

            // Optionally, call a function to update the main page
            updateMainPageEmotion(dominantEmotion);
        }
    }, 200);
};

// Function to pass emotion to the main page
const updateMainPageEmotion = (emotion) => {
    const emotionDisplay = document.getElementById('emotionDisplay');
    if (emotionDisplay) {
        emotionDisplay.textContent = `Current Emotion: ${emotion}`;
    }
};

run();
