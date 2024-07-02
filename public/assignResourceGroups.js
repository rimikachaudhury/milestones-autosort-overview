    //function to initializeDB and import it in the current module
    async function initializeDBHandler() {
        let dbHandler;
        if (!dbHandler) {
            // Import the database handler module only once
            return import('./DBHandlerRbO.js').then(module => {
                dbHandler = module; // Assign the imported module to the variable
                return dbHandler; // Return the module after it's initialized
            }).catch(error => {
                console.error('Error importing DBHandlerRbO.js:', error);
            });
        }else {
            // If the module is already imported, return it immediately
            return Promise.resolve(dbHandler);
        }
}


export async function assignResourceGroups(dataObject, categories){
    console.log("assignResourceGroups is called with arguments: ", dataObject); 

    const categoryData = {};

    for (const categoryName in categories) {
        //initialize categoryData array to hold resources based on the categoryName;
        categoryData[categoryName] = [];
    }

            // Re-organize data into groups or arrays based on categorization rules

            dataObject.forEach(siteInfo => {
                console.log("---inside categorization logic loop---")
                let categorized = false;
    
                    // CASE 1: Check if DB>siteInfo has a category property and if it has a value
                    //no DB update required
                if (siteInfo.hasOwnProperty('categoryName') && 
                        (siteInfo.categoryName !== null || 
                        siteInfo.categoryName !== undefined)) 
                    {
                        console.log("CASE 1: this siteInfo has a categoryName property", siteInfo.categoryName)
                        if(siteInfo.categoryName === 'uncategorized') {
                            console.log("...and the category is uncategorized")
    
                            //auto-assign categories:
    
                            for (const categoryName in categories) {
                                if (categories[categoryName].some(keyword => siteInfo.url.includes(keyword))) 
                                {
                                    console.log("CASE 1: Auto-assign category to: ", siteInfo)
                
                                    siteInfo.categoryName = categoryName;
                                    // call updateDocument function to update the category property in the database
                                    initializeDBHandler().then(dbHandler => {
                                        dbHandler.updateDocument(siteInfo);
                                    })
    
                                     //push the newly auto-categorized siteInfo into the categoryData array
                                     if (categories.hasOwnProperty(categoryName)) {
                                    console.log("current site pushed into categoryData array: ", categoryName)
                                    // categorize for the frontend
                                    categoryData[categoryName].push(siteInfo);
                                    //mark siteInfo as categorized
                                    categorized = true;
                                    break;
                                     }
                                } //end of if statement
                            } //end of for loop
    
    
                        }else{
                            const categoryName = siteInfo.categoryName.toLowerCase();
                            //check if the siteInfo.categoryName is a key in the categories object set in the for loop above
                            if (categories.hasOwnProperty(categoryName)) {
                                //mark siteInfo as categorized
                                categorized = true;
                                //organize siteInfo for frontend into the categoryData object
                                categoryData[categoryName].push(siteInfo);
                                //already updated in DB so no need to call DB update function
                                }    
    
                        }
    
                       // console.log("CASE 1:Step 2 - based on keyword in URL",keyword, "automatically assigned categoryName: ", siteInfo.categoryName)
                        // call updateDocument function to update the category property in the database
                        // initializeDBHandler().then(dbHandler => {
                        //     dbHandler.updateDocument(siteInfo);
                        // })
                                               
                    
                    }
                    else {
    
                    // UNLIKELY CASE 2: if DB>siteInfo DOES NOT have a categoryName property, 
                    //categorize it based on the URL (and automatically updateDB)
                    //or push it to the uncategorized category (manual updateDB)
                    // Check if any keyword in the category is present in the siteInfo's URL
                    for (const categoryName in categories) {
                        if (categories[categoryName].some(keyword => siteInfo.url.includes(keyword))) 
                        {
                            console.log("CASE 2:Step 1- this siteInfo does not have a categoryName property", siteInfo)
                            // Automatically set the category property - will need to be updated to DB in the future
                            siteInfo.categoryName = categoryName;
                            console.log("CASE 2:Step 2 - based on keyword in URL",keyword, "automatically assigned categoryName: ", siteInfo.categoryName)
                            // call updateDocument function to update the category property in the database
                            initializeDBHandler().then(dbHandler => {
                                dbHandler.updateDocument(siteInfo);
                            })
                             //check if the siteInfo.categoryName is a key in the categories object set in the for loop above
                             if (categories.hasOwnProperty(categoryName)) {
                            console.log("current site pushed into categoryData array: ", categoryName)
                            // categorize for the frontend
                            categoryData[categoryName].push(siteInfo);
                            //mark siteInfo as categorized
                            categorized = true;
                            break;
                             }
                        } //end of if statement
                    } //end of for loop
                } //end of else statement
    
                //handles the remaining case where siteInfo does not have a categoryName property
                if (!categorized) {
                    console.log("CASE 3: categorized flag is still false for: ", siteInfo)
                    // If the siteInfo is not categorized, push it to the uncategorized group
                    categoryData['uncategorized'].push(siteInfo);
                }
    
    
                //console.log("Organized categoryData is",categoryData)
    
            });//end of categorization loop for categoryData

            return Promise.resolve(categoryData);

}