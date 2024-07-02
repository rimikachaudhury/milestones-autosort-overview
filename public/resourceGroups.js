//import { updateDocument } from './DBHandlerRbO.js';

(function($) {

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
    //function to initialize assignResourceGroups and import it in the current module
    //because: categorization rules: lines 65-174 MOVED TO assignResourceGroups.js line 7-115
    async function initializeResourceGroups() {

        let importedmodule;
        if(!importedmodule){
            return import('./assignResourceGroups.js').then(module => {
                importedmodule = module;
                return importedmodule;
            }).catch(error => {
                console.error('Error importing assignResourceGroups.js:', error);
            });
       }
       else{
            return Promise.resolve(importedmodule); 
       }
    }


// Define the jQuery plugin to organize the sorted data coming from main.js into flexible columns
$.fn.renderResourceGroups = function(dataObject) {  

    //Page refresh logic to maintain the state of the accordion
    // Function to display the last refreshed time
    function displayLastRefreshed() {
        const lastRefreshTime = new Date();
        const $lastRefreshed = $('#lastRefreshed');

        function updateRefreshTime() {
            const currentTime = new Date();
            const timeDifference = Math.floor((currentTime - lastRefreshTime) / 60000); // Convert milliseconds to minutes
            $lastRefreshed.html(`Page refreshed ${timeDifference} minute(s) ago
                <i id="refreshIcon" class="fa-solid fa-sync" style="cursor: pointer; margin-left: 10px;"></i>`);
            
            // Add event listener for refresh icon
            $('#refreshIcon').on('click', function() {
                location.reload();
            });
        }

        updateRefreshTime();
        setInterval(updateRefreshTime, 60000); // Update every minute
    }//end of displayLastRefreshed function

    displayLastRefreshed();


    // Initialize columns data
    var categoryData = {};
    let tempCategoryData = {};

    console.log('function called to organize data into categories');
    // Define column names and corresponding categorization rules
        const categories = {
            'articles': ['wikipedia','medium','towardsdatascience','analyticsvidhya','hackernoon',],
            'lectures_and_demos': ['youtube','coursera','udemy','khanacademy','edx','udacity','pluralsight','skillshare','codecademy','datacamp','treehouse','lynda','linkedin','linuxacademy','cloudacademy','acloudguru'],
            'step_by_step_tutorials': ['tutorialspoint', 'geeksforgeeks', 'javatpoint', 'programiz', 'tutorialrepublic', 'w3schools', 'tutorialsdojo', 'tutorialsteacher'],
            'discussion_forum_helpseeking': ['stackoverflow','reddit','quora','discuss.pytorch.org','discuss.tensorflow.org','discuss.fast.ai','discuss.huggingface.co','discuss.pytorchlightning.ai','discuss.streamlit.io','discuss.d2l.ai','discuss.paddlepaddle.org','discuss.mxnet.apache.org','discuss.tensorflow.org','discuss.pytorch.org','discuss.fast.ai','discuss.huggingface.co','discuss.pytorchlightning.ai','discuss.streamlit.io','discuss.d2l.ai','discuss.paddlepaddle.org','discuss.mxnet.apache.org'],
            'ai_help': ['chat.openai.com',],
            'my_work': ['https://docs.google.com/document', 'kdnuggets','codepen','github','kaggle','colab','jupyter','repl.it','datacamp','treehouse','lynda','linkedin','linuxacademy','cloudacademy','acloudguru','stackoverflow','reddit','quora'],
            'uncategorized': [] // Default column for uncategorized data
        };

        const categoryColors = {
            'articles': '#ecc5b7',
            'lectures_and_demos': '#d7947d',
            'step_by_step_tutorials': '#b97763',
            'discussion_forum_helpseeking': '#7eaba6',
            'ai_help': '#5abba7',
            'my_work': '#6ad6e7',
            'uncategorized': '#D3D3D3'
        };
    
    initializeResourceGroups().then(importedmodule => {
        importedmodule.assignResourceGroups(dataObject, categories).then(categoryData => {
            categoryData = categoryData;
            console.log("Grouped categoryData is",categoryData);   
            
            //categorization rules: lines 65-174 MOVED TO assignResourceGroups.js line 7-115
        // Sort the categories based on totalTimeActiveSeconds in descending order
            const sortedCategoryData = Object.keys(categoryData)
            .sort((a, b) => {
                const totalTimeA = categoryData[a].reduce((total, siteInfo) => total + siteInfo.timeActive, 0);
                const totalTimeB = categoryData[b].reduce((total, siteInfo) => total + siteInfo.timeActive, 0);
                return totalTimeB - totalTimeA;
            })
            .reduce((sortedCategories, categoryName) => {
                sortedCategories[categoryName] = categoryData[categoryName];
                return sortedCategories;
            }, {});

        console.log("Grouped and sorted categoryData is",sortedCategoryData);   

         // FRONT END LOGIC TO RENDER SITEINFO INTO CATEGORIES
         //Includes 1) loop for creating Accordion container, header and body, AND event listeners (to update like, dislike, categories)

         //Initialize front-end logic variables
         const $categoriesContainer = this;
         $categoriesContainer.empty(); // Clear existing content

         //Define header colors for accordion
         let headerColors = ['#D3D3D3','#6ad6e7','#5abba7', '#7eaba6', '#b97763', '#d7947d', '#ecc5b7']; //starts with grey - applied in reverse order

         let headerColorsCount = headerColors.length;

         
            //Add a mapping of category names to their corresponding icons:
            const categoryIcons = {
                'articles': 'fa-regular fa-file-lines',
                'lectures_and_demos': 'fa-regular fa-file-video',
                'step_by_step_tutorials': 'fa-solid fa-stairs',
                'discussion_forum_helpseeking': 'fa-solid fa-users',
                'ai_help': 'fa-solid fa-robot',
                'my_work': 'fa-solid fa-laptop-code',
                'uncategorized': 'fa-regular fa-object-ungroup' // Default column for uncategorized data
                };

        // FRONT-END MASTER LOOP TO RENDER SITEINFO INTO CATEGORIES - line 78-227
         for (const categoryName in sortedCategoryData) {

            //defines the accordion container for each category
            const $category = $('<div class="category accordion-item"></div>').css('border', '1px solid #ccc');
            
            const isUncategorized = categoryName === 'uncategorized';
            
            //const itemCount = categoryData[categoryName].length;
            const itemCount = categoryData[categoryName].filter(siteInfo => !siteInfo.psuedoDeleteFlag).length;


            const deletedItemCount = categoryData[categoryName].filter(siteInfo => siteInfo.psuedoDeleteFlag).length;


                // Calculate total time active for the category
                let totalTimeActiveSeconds = 0;
                categoryData[categoryName].forEach(siteInfo => {
                    totalTimeActiveSeconds += siteInfo.timeActive;
                });

                // Convert total time active to hours, minutes, and seconds
                const hours = Math.floor(totalTimeActiveSeconds / 3600);
                const minutes = Math.floor((totalTimeActiveSeconds % 3600) / 60);
                const seconds = totalTimeActiveSeconds % 60;

                  // Format the total time active
                const formattedTotalTimeActive = `${hours}h ${minutes}m ${seconds}s`;

                        
            //LOGIC FOR ACCORDION
            // Add Bootstrap accordion header
            const $accordionHeader = $(`
            <div class="accordion-header" id="heading${categoryName}" >
                <div class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${categoryName}" aria-expanded="true" aria-controls="collapse${categoryName}"
                style="cursor: pointer; background-color: ${categoryColors[categoryName]}; ">

                    <div class="container-fluid">
                        <div class="row">
                            <div class="col-12 col-md-6 d-flex align-items-center">
                                <i class="${categoryIcons[categoryName]} fa-2xl"></i> &nbsp &nbsp
                                <h4> ${categoryName} </h4> 
                            </div>
                               
                            <div class="col-12 col-md-6 text-end d-flex align-items-center justify-content-end">
                            <span>
                                    &#160
                                    <i class="fa-solid fa-lines-leaning">
                                    </i> items <i class="fa fa-eye" aria-hidden="true"></i>: ${itemCount} |
                                    removed <i class="fa-solid fa-trash-can"></i>: ${deletedItemCount} |
                                    &#160 
                                    <i class="fa-regular fa-clock"></i> duration: ${formattedTotalTimeActive}</span>
                            </div>
                
                        </div>
                    </div>
                </div>
            </div>
        `);

        // Add Bootstrap accordion body - loops using map over siteInfo 
        

        const $accordionBody = $(`
            <div id="collapse${categoryName}" class="accordion-collapse collapse"
                aria-labelledby="heading${categoryName}" data-bs-parent="#categoriesContainer">
                <div class="accordion-body">
                    <!-- Add item list to category -->
                    <ul class="list-group">
                        ${categoryData[categoryName].map(siteInfo =>`
                        <li class="list-group-item ${siteInfo.psuedoDeleteFlag ? 'hidden' : ''}">
                        <div class="container">
                        <div class="row py-3">
                                <div class="col-1 col-md-1 d-flex align-items-center justify-content-center">
                                ${siteInfo.isExactBookmark ? '<i class="fa-solid fa-star fa-2xl" style="color: #74C0FC;"></i>' : '<i class="fa-regular fa-star fa-2xl" style="color: #E9EAEC;"></i>'}
                                </div>

                                <div class="col-7 col-md-5 d-flex flex-column">
                                    <a href="${siteInfo.url}" target="_blank" style="text-decoration: none">${siteInfo.title}</a>
                                    <div><button class="btn btn-light" disabled> 
                                         <i class="fa-regular fa-clock"></i>${siteInfo.timeActive} seconds</button>
                                    </div>
                                </div>

                                <div class="col-4 col-md-2 d-flex align-items-center justify-content-center">
                                <button class="btn btn-light" disabled>${siteInfo.qtag}</button>
                                </div>

                                 <div class="col-8 col-md-2 d-flex justify-content-end align-items-center">
                                        <button class="btn btn-outline-primary like-btn" data-item-id="${siteInfo.url}"><i class="fa-regular fa-thumbs-up fa-2xl"></i> &nbsphelpful </button>
                                        
                                        <button class="btn btn-outline-secondary dislike-btn" data-item-id="${siteInfo.url}"><i class="fa-regular fa-thumbs-down fa-2xl"></i> unhelpful </button>
                                </div>
                                <div class="col-4 col-md-1 d-flex justify-content-end align-items-center">
                                    <button class="btn btn-outline-danger delete-btn" data-item-id="${siteInfo.url}"><i class="fa-solid fa-trash-can"></i></button>
                                </div>
                        </div>
                        
                        <div class="row py-3">
                                <div class="col-1 col-md-1 d-flex align-items-center justify-content-center">
                                    <i class="fa-solid fa-object-ungroup" style="color: grey"></i>
                                </div>                            
                            
                                <div class="col-11 col-md-11">
                                    ${Object.keys(categories).map(category => `
                                    <button type="button" class="btn btn-outline-secondary category-button"  value="${category}" data-item-id="${siteInfo.dateAdded}" data-selected="false">${category}</button>
                                `).join('')}                      
                            
                                </div>
                            </div>
                        </div>
                        </li>`).join('')}
                    </ul>
                </div>
            </div>
        `);

    headerColorsCount = headerColorsCount - 1;

        $category.append($accordionHeader, $accordionBody);
        $categoriesContainer.append($category);

        //apply addClass('active') to siteInfo that has been liked or disliked
        categoryData[categoryName].forEach(siteInfo => {
            if (siteInfo.like) {
                $accordionBody.find(`.like-btn[data-item-id="${siteInfo.url}"]`).addClass('btn-success active');
            }
            if (siteInfo.dislike) {
                $accordionBody.find(`.dislike-btn[data-item-id="${siteInfo.url}"]`).addClass('btn-danger active');
            }
            if (siteInfo.psuedoDeleteFlag) {
                $accordionBody.find(`.delete-btn[data-item-id="${siteInfo.url}"]`).addClass('hidden');
            }
            
        });

        //ADD EVENT LISTENER FOR DELETE BUTTON

        $accordionBody.find('.delete-btn').on("click",function(){
            console.log("delete button was clicked")
            // Add your JavaScript code to handle the delete functionality here
            const siteInfo = categoryData[categoryName].find(siteInfo => siteInfo.url === $(this).data('item-id'));
            // Toggle the value of siteInfo.psuedoDeleteFlag
            siteInfo.psuedoDeleteFlag = !siteInfo.psuedoDeleteFlag; 

            //update the database - uncomment the following lines when ready to test database integration
            initializeDBHandler().then(dbHandler => {
                console.log("updating the DB with the new psuedoDeleteFlag value",siteInfo.psuedoDeleteFlag)
                dbHandler.updateDocument(siteInfo);
            })

            // Add or remove the 'active' class based on the value of siteInfo.psuedoDeleteFlag
            if (siteInfo.psuedoDeleteFlag) {
                $(this).addClass('btn-danger active');
                $(this).closest('.list-group-item').css('display', 'none');
            } else {
                $(this).removeClass('btn-danger active');
                $(this).closest('.list-group-item').css('display', ''); // Restore the display
            }
            //trigger notification to user
            showDeleteToast(siteInfo);
            
            //remove/or set display:none for the siteInfo row from the list-group-item

        })//end of delete button event listener

                    // Show delete toast message
                    function showDeleteToast(siteInfo) {
                        const $deleteToast = $('#deleteToast');

                        const toastBody = $deleteToast.find('.toast-body');

                        // Update the toast message to include the title
                        toastBody.html(`
                            The entry "${siteInfo.title}" was successfully deleted.
                            <div class="mt-2 pt-2 border-top">
                                <button type="button" class="btn btn-primary btn-sm undo-btn">Undo</button>
                                <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">Close</button>
                            </div>
                        `);

                        const toast = new bootstrap.Toast($deleteToast);
                        toast.show();
        
                        // Add undo functionality
                        $deleteToast.find('.undo-btn').off('click').on('click', function() {
                            siteInfo.psuedoDeleteFlag = false;
                            initializeDBHandler().then(dbHandler => {
                                dbHandler.updateDocument(siteInfo);
                            });
                             $(`.delete-btn[data-item-id="${siteInfo.url}"]`).removeClass('btn-danger active');
                            $(`.delete-btn[data-item-id="${siteInfo.url}"]`).closest('.list-group-item').css('display', ''); // Restore the display
                            
                            toast.hide();
                        });
                    }
       
        // ADD EVENT LISTENERS FOR LIKE BUTTON
        
        $accordionBody.find('.like-btn').on("click",function(){
        console.log("like button was clicked")
        const siteInfo = categoryData[categoryName].find(siteInfo => siteInfo.url === $(this).data('item-id'));
        //check if siteInfo could be an array? ans: no. find fn returns the first element for which the url-match condition is true
        //also, urls are uniquely updated in the database - yay!
        
        // Toggle the value of siteInfo.like
        siteInfo.like = !siteInfo.like;
        // Call the function to update the DB with the new like value
        initializeDBHandler().then(dbHandler => {
                dbHandler.updateDocument(siteInfo);
            })

                // Add or remove the 'active' class based on the value of siteInfo.like
                if (siteInfo.like) {
                    $(this).addClass('btn-success active');
                } else {
                    $(this).removeClass('btn-success active');
                }      

        }); //end of like button event listener


        // ADD EVENT LISTENERS FOR DISLIKE BUTTON

        $accordionBody.find('.dislike-btn').on("click",function(){
                console.log("dislike button was clicked")
                const siteInfo = categoryData[categoryName].find(siteInfo => siteInfo.url === $(this).data('item-id'));
                // Toggle the value of siteInfo.like
                siteInfo.dislike = !siteInfo.dislike;
            
                //Call the function to update the DB with the new dislike value
                initializeDBHandler().then(dbHandler => {
                    dbHandler.updateDocument(siteInfo);
                })

                // Add or remove the 'active' class based on the value of siteInfo.like
                if (siteInfo.dislike) {
                    $(this).addClass('btn-danger active');
                } else {
                    $(this).removeClass('btn-danger active');
                }        
        }); //end of dislike button event listener
 
     
            //ADD EVENT LISTENERS FOR BUTTONS TO MANUALLY CATEGORIZE RESOURCES

            $accordionBody.on('click', '.category-button', function() {
                const $button = $(this);
                const categoryId = $(this).val(); // Get the value of the selected button
                let newCategory = categoryId;

                // Define categoryFlag variable to keep track of selection status
                let categoryFlag = categoryId;
                // Find the corresponding siteInfo object based on data-item-id attribute
                const siteInfo = Object.values(categoryData).flat().find(item => item.dateAdded === $(this).data('item-id'));
                //previous category
                let previousCategory = siteInfo.categoryName;

                // Add and Update the category property of the siteInfo object
                siteInfo.categoryName = categoryId;            

                console.log('Updated siteInfo:', siteInfo);

                // Call the function to update the DB with the new category value

                initializeDBHandler().then(dbHandler => {
                    dbHandler.updateDocument(siteInfo);
                })

    // Toggle the selection state of the button and apply/remove the active class
    let isSelected = $button.data('selected') || false; // Get the current selection state
    isSelected = !isSelected; // Toggle the selection state

    // Apply the active class to the current button if selected, and remove it from siblings
    if (isSelected) {
        $button.removeClass('btn-light').addClass('active btn-warning')
        $button.siblings('.category-button').removeClass('active btn-warning').addClass('btn-light');
    } else {
        $button.removeClass('active btn-warning').addClass('btn-light');
    }

    // Update the selection state in the button's data attribute
    $button.data('selected', isSelected);

    //trigger notification to user
    showRecategorizationToast(siteInfo, newCategory, previousCategory);

        });//end of event istener for category buttons

        // Show recategorization toast message
        function showRecategorizationToast(siteInfo, newCategory, previousCategory) {

            const $recategorizationToast = $('#recategorizationToast');

            const toastBody = $recategorizationToast.find('.toast-body');

            // Update the toast message to include the title and new category
            toastBody.html(`
                The entry "${siteInfo.title}" was successfully moved to "${newCategory}" category.
                <div class="mt-2 pt-2 border-top">
                    <button type="button" class="btn btn-primary btn-sm undo-recategorization-btn">Undo</button>
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="toast">Close</button>
                </div>
            `);

            const toast = new bootstrap.Toast($recategorizationToast);
            toast.show();

            // Add undo functionality
            $recategorizationToast.find('.undo-recategorization-btn').off('click').on('click', function() {
                // Undo the recategorization action
                // Add your code here to move the entry back to its previous category

                siteInfo.categoryName = previousCategory;

                //Update the database
                initializeDBHandler().then(dbHandler => {
                    dbHandler.updateDocument(siteInfo);
                });
                // Hide the toast
                toast.hide();
            });
        }//end of showRecategorizationToast function


        //ADD EVENT LISTENERS FOR RADIO BUTTONS TO MANUALLY CATEGORIZE RESOURCES
        // $accordionBody.find('.form-check-input').on('change', function() {
        //         const categoryId = $(this).val(); // Get the value of the selected radio button
            
        //         // Find the corresponding siteInfo object based on data-item-id attribute
        //         const siteInfo = categoryData['uncategorized'].find(item => item.dateAdded === $(this).data('item-id'));
            
        //         // Add and Update the category property of the siteInfo object
        //         siteInfo.categoryName = categoryId;

        //         console.log('Updated siteInfo:', siteInfo);

        //         // Call the function to update the DB with the new category value

        //         initializeDBHandler().then(dbHandler => {
        //             dbHandler.updateDocument(siteInfo);
        //         })
        // });
        
    }// END OF FRONT-END MASTER LOOP TO RENDER SITEINFO INTO CATEGORIES



        // Add Bootstrap accordion container
        
        $categoriesContainer.addClass('accordion').attr('id', 'categoriesContainer');

        // Enable Bootstrap accordion behavior
        const accordion = new bootstrap.Collapse(document.getElementById('categoriesContainer'), {
            // Set to true if you want to allow multiple accordions to be open at once
            toggle: true}); //not working currently when i put the brackets below this point. why?

        });//end of assignResourceGroups function
    })//end of initializeResourceGroups function


        // Return the jQuery object to maintain chainability
        return this;

} // END OF renderResourceGroups function



// Function to create radio buttons for category selection
// function createCategoryRadioButtons(item) {
//     return `
//     <form>
//     <fieldset id="${item.url}">
//         <div class="form-check">
//             <input type="radio" class="form-check-input" name="categoryRadio" value="articles" data-item-id="${item.dateAdded}">
//             Article
//         </div>
//         <div class="form-check">
//             <input type="radio" class="form-check-input" name="categoryRadio" value="lectures_and_demos" data-item-id="${item.dateAdded}">
//             Lectures and Demos
//         </div>
//         <div class="form-check">
//             <input type="radio" class="form-check-input" name="categoryRadio" value="step_by_step_tutorials" data-item-id="${item.dateAdded}">
//             Step by Step Tutorials
//         </div>        
//         <div class="form-check">
//             <input type="radio" class="form-check-input" name="categoryRadio" value="discussion_forum_helpseeking" data-item-id="${item.dateAdded}">
//             Discussion Forum/Helpseeking
//         </div>
//         <div class="form-check">
//             <input type="radio" class="form-check-input" name="categoryRadio" value="ai_help" data-item-id="${item.dateAdded}">
//             AI Help
//         </div>

//     </fieldset>
//     </form>
//     `;
// }//end of createCategoryRadioButtons function


})(jQuery);
