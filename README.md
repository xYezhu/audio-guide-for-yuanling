This audio guide prototype for YuanLing Street includes a step-by-step tutorial on uploading your work to the application.

**1. Upload your audio files**

Inside 'static', you could upload your sound design files to 'audio'. As an example, when you upload 'track1.mp3', it needs to be preloaded in the home page. To acheive that, add the files inside index.html as follows:

    const audioFiles = [
        "static/audio/track1.mp3",
         // add more below...   
    ];

After that, the audio files needs to be assigned to the related location inside playFile.js:

    let tracks = {
        "location1": "static/audio/track1.mp3",
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
    
**3. Upload your images**

To upload your own group image, simply swap the image inside image folder. Note: please keep the name of your image as image1-4, following your group number.

**4. Change the group name**

To change your group project name, navigate to index.html, find the navigation buttons. As an example, if you want to change 'group1' to 'yuan ling street', modify it as below;

before:

        <div class="group-content">group 1</div>
    


after:

        <div class="group-content">yuan ling street</div>
        



© Hao ZHENG, Marcel SAGESSER, SUSTech School of Design, 2024

