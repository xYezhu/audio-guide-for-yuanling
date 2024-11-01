This audio guide prototype for YuanLing Street includes a step-by-step tutorial on uploading your work to the application. To start using this project, you need to create your own copy by forking the repository. To do this, click the “Fork” button at the top right corner of this page. This will create a personal copy of the repository under your own GitHub account. You can then clone your fork to your local machine to begin working on it. Remember, any changes you push to your forked repository won’t affect the original project, so feel free to experiment! Use different branches for different groups.

### Development Guide ###

**1. Upload your audio files**

Inside 'static', you could upload your sound design files to 'audio'. As an example, when you upload 'group1_track1.mp3', it needs to be preloaded in the home page. To acheive that, add the files inside preLoad.js as follows:

    const audioFiles = [
        "static/audio/group1/group1_track1.mp3",
         // add more below...   
    ];

After that, the audio files needs to be assigned to the related location inside playFile.js (static-js), if you are group1, update playFiles1.js, if you are group2, update playFiles2.js. and so on:

    let tracks = {
        "location1": "static/audio/group1/group1_track1.mp3",
        // add more below...
    };

**2. Define your location**

To define your specific location, modify the code in handleLocationChange function within playFiles.js:    
    
    if (latitude > 22 && latitude < 23 && longitude > 113 && longitude < 114) {
        playTrack(tracks["location1"], "location1");        
    } else if (latitude > 23 && latitude < 24 && longitude > 114 && longitude < 115) {
        playTrack(tracks["location2"], "location2");        
    } else if (...){
            ...        
    }

**3. Adjust the fade in and fade out**

To adjust the fade in and fade out of your tracks, navigate to the top of playFiles.js and edit the code below:

    let fadeInDuration = 2000; // millisecond, adjust as needed
    let fadeOutDuration = 2000; // millisecond, adjust as needed

**3. Adjust the track volume**

To adjust the background track volume and other track volume, update the number in functions below (inside playFiles):

    function startBackgroundTrack() {
        const backgroundFile = "static/audio/background1.mp3";
        loadAndPlayAudio(backgroundFile, true, true, function(player) {
            backgroundTrack = player;
            console.log("background track started.");
        });
        backgroundTrack.volume.value = -12; // set the background track volume here
    }

for other tracks, change here:

    function loadAndPlayAudio(file, loop = true, fadeIn = false, callback, volume = -12)
    
**5. Upload your images**

To upload your own group image, simply swap the image inside image folder. Note: please keep the name of your image as image1-4, following your group number.

**6. Change the group name***

To change your group project name, navigate to index.html, find the navigation buttons. As an example, if you want to change 'group1' to 'yuan ling street', modify it as below;

before:

        <div class="group-content">group 1</div>
    


after:

        <div class="group-content">yuan ling street</div>
        

### Testing Page Guide ###

The testing page provides a comprehensive overview of how your project will sound in action. The red dot represents the user, and its pseudo-geolocation is displayed below the map as it moves. Red squares indicate locations that trigger different soundtracks, with each square linked to its corresponding track. For example, entering square 1 will play track 1. Below are detailed instructions on how to use the testing page.

1. Use WASD on your keyboard to move the red dot.
2. Use the add button to create a new square, and when holding the square and press delete on your keyboard, the selected square will be deleted. Squares can be drag and moved with mouse.
3. Press 'p' or 'P' on your keyboard to print the geo location of all the squares, which you could use to set the range in playFiles accordingly.


© Hao ZHENG, Marcel SAGESSER, SUSTech School of Design, 2024

