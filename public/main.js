// helloworld database secret key: fnAFLgiyHqAARM3hOMlaMuvqhwwlaMIOVcKU66Os

//declare global variables
var userInput = "";
window.collectionName = ""; //can be declared var too, I think

window.siteInfoData = [];

// Function to handle user input submission
function submitUserInput() {
    userInput = document.getElementById('userInput').value;
    
    // Use the user input as needed (e.g., send it to the server, perform some action, etc.)
    console.log('User Input:', userInput);

    //assign collectionName the value of userInput to save the collection name
    collectionName = userInput;

    //test if collection name is being saved
    console.log('Collection Name:', collectionName);

    //call function to fetch data from the database
    fetchData(collectionName);

    // Optionally, clear the user input field after submission
    document.getElementById('userInput').value = '';
}

// Add event listener to the user input field to submit on Enter key press
const userInputField = document.getElementById('userInput');
userInputField.addEventListener('keypress', function(event) {
    if (event.key === 'Enter') { // Check if the Enter key is pressed
        submitUserInput(); // Call the submitUserInput function
    }
});

// //fetch data directly from the database
async function fetchData(collectionName){
//assign the returned data to a variable

    try{
        var fetchedData = await client.query(q.Map(q.Paginate(
            q.Documents(q.Collection(collectionName))),
         q.Lambda(x => q.Get(x))
        ))
    }catch(err){
        console.error('Error while fetching from the database %s', err);
        alert('Incorrect username. Please try again!');
    }
    console.log("fetchedData is: ", fetchedData);

    //call function to process the fetched data - sort it according to totalTime or timeActive
    processFaunaData(fetchedData.data);
    
    //return the fetched data
    return fetchedData;
}

//process the fetched data
async function processFaunaData(fetchedData){
    console.log("fetchedData.data is: ", fetchedData);
    console.log("type of fetchedData.data is: ", typeof(fetchedData));
    var data = fetchedData;
    
//     // Assuming 'siteInfoData' is a global variable or can be accessed globally
  window.siteInfoData = data.map(item => {
    const siteInfo = item.data.siteInfo;

    // Assign default values for missing fields
    const title = siteInfo.title || siteInfo.siteName;
    const url = siteInfo.url || 'https://noUrlFound.com';
    const qtag = siteInfo.qtag !== undefined ? siteInfo.qtag : ['no-qtags-yet'];
    const qtags = siteInfo.qtags !== undefined ? siteInfo.qtags : ['no-qtags-yet'];
    const like = siteInfo.like !== undefined ? siteInfo.like : false;
    const dislike = siteInfo.dislike !== undefined ? siteInfo.dislike : false;
    const isExactBookmark = siteInfo.isExactBookmark !== undefined ? siteInfo.isExactBookmark : false;
    const timeActive = siteInfo.timeActive !== undefined ? siteInfo.timeActive : 0;
    const totalTime = siteInfo.totalTime !== undefined ? siteInfo.totalTime : 0;
    const categoryName = siteInfo.categoryName !== undefined ? siteInfo.categoryName : 'uncategorized';
    const psuedoDeleteFlag = siteInfo.psuedoDeleteFlag !== undefined ? siteInfo.psuedoDeleteFlag : false;
    return {
      dateAdded: item.ts,
      title,
      url,
      qtag,
      like,
      dislike,
      isExactBookmark,
      timeActive,
      totalTime,
      categoryName,
      psuedoDeleteFlag,
    };
  });
    console.log('Processed Data:', window.siteInfoData);

    //call the function to sort data
   sortData(window.siteInfoData);


}

function sortData(data){
    data.sort((a, b) => {
        if (a.totalTime === 0 || b.totalTime === 0) {
          // If both have totalTime zero, sort based on timeActive
          return b.timeActive - a.timeActive;
      } else {
          // Otherwise, sort based on totalTime
          return b.totalTime - a.totalTime;
      }

      });
        console.log('Sorted Data:', data);

        // Call the jQuery plugin to organize data into columns
        $('#columns-container').renderResourceGroups(data);

        return data;

}

// Function call to update the DOM based on the processed data



//retired code below - keeping for reference 10 March 2024

// // Get the elements with class="column"
// var elements = document.getElementsByClassName("column");

// // Declare a loop variable
// var i;

// // populate data in the rows
// function populateData(){
//     console.log("populating data in rows");
    
//     //console.log("recordingValues in populateData is: ", recordingValues);
//     for (i = 1; i <= elements.length; i++) {

//         //console.log("recordingValues[i] is: ", recordingValues[i]);
//         //elements[i].innerHTML = recordingValues[i].siteName;
//         let txt = "";

//         //pulling the top i items from recordingValues
//         for (let x in recordingValues[i]) {
//             txt += recordingValues[i][x] + "<br>";

//             //conditionally apply background color based on base_url
//             if (x == "url"){
//                 let base_url = getUrlBase(recordingValues[i][x])
//                 console.log("base_url is: ", base_url)
//                 if (base_url == "youtube"){
//                     elements[i].style.backgroundColor = "lightgoldenrodyellow";
//                 }
//                 else if (base_url == "mozilla"){
//                     elements[i].style.backgroundColor = "lightblue";
//                 }
//                 else if (base_url == "wikipedia"){
//                     elements[i].style.backgroundColor = "turquoise";
//                 }
//           };
//         //elements[i].innerHTML = recordingValues[i].siteName;
//         elements[i].innerHTML = txt;
//         //conditionally apply background color
//         if (recordingValues[i].bookmark == true){
//             elements[i].style.fontWeight = "900";
//         }

//     }
// }
// }

// function getUrlBase(url){
//     console.log("url sent to getUrlBase: ",url)
//     let url_components = url.split(".")
//     // console.log(url_components)
//     if (url_components.length == 2){
//         url_components = url_components[0].split(/[A-Za-z]*:*[\/]*/)
//         //console.log("base url component: ", url_components[1])
//     }
//     return url_components[1]
// }


//browser.storage.sync.get.then() // should get entire synced storage from across devices
// get previously stored bookmarked values on startup;

// initializeOverview();

// function initializeOverview(){

//     console.log("initializing overview");
//     let gettingAllStorageItems = browser.storage.local.get(null);
//     gettingAllStorageItems.then((results) => {
//         console.log(results.jsonvals.recordingKey); //access the 5th array item - coz bookmark is true for that one
//         let allKeys = Object.keys(results); //this returns "jsonvals" as the key, packed as an array of length 1!
//         //console.log(allKeys); 
//     });
// }
