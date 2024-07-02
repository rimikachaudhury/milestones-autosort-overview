// This file contains the functions to interact with the FaunaDB database for the Resources by Overview page
// Function to generate the index name based on collectionName
export function generateIndexName() {
    if (!window.collectionName) {
        throw new Error('Collection name is not defined.');
    }

    // Concatenate the prefix with the collectionName
    const indexName = `siteInfo_by_url_${window.collectionName}`;
    return indexName;
}



//function to handle manual DB update

export async function updateDocument(siteInfo) {
    try{
        //Lookup the url to check if the document with a matching url already exists
        const siteInfoUrl = siteInfo.url;
        const indexName = generateIndexName();
        //console.log("generated indexName is", indexName," and siteInfoUrl is",siteInfoUrl);
        
        console.log("STEP 1: siteInfoUrl for the clicked resource is",siteInfoUrl);

        //index should be a user input
        const existingDocumentObject = await client.query(
            q.Map(q.Paginate(q.Match(q.Index(indexName), siteInfoUrl)),
         q.Lambda('X', q.Get(q.Var('X')))));

         console.log("STEP 2: existingDoc is",existingDocumentObject);

        // if multiple matching documents are returned, save it in an array
        if (existingDocumentObject.data.length > 0) {
            // Case 1: Document exists, update the existing document
            const existingDocumentArray = existingDocumentObject.data;

        //Look for the ref on each document to initiate update
        for (const existingDocument of existingDocumentArray) {
            const existingDocumentRef = existingDocument.ref;
            console.log("STEP 3: existingDocumentRef is",existingDocumentRef);

            // Update the existing document with the new like/dislike value
            const updatedDocument = await client.query(
                q.Update(
                    existingDocumentRef,
                    { data:
                        { siteInfo:
                            {isExactBookmark: siteInfo.isExactBookmark, 
                            like: siteInfo.like,
                            dislike: siteInfo.dislike,
                            qtag : siteInfo.qtag,
                            // timeActive : siteInfo.timeActive,
                            // totalTime : siteInfo.totalTime,
                            categoryName: siteInfo.categoryName,
                            psuedoDeleteFlag: siteInfo.psuedoDeleteFlag
                            

                            } 
                        }
                    }
                )
            );
            console.log("STEP 4: SUCCESS! updatedDocument is",updatedDocument);
                            
        } //end of for loop for each existing document
        } // end of if statement for multiple matching documents
        else{
            // Case 2: Document does not exist, comsole.log saying the update was unsuccessful
            console.log("No matching documents were found on the DB.")
            // const newDocument = await client.query(
            //     q.Create(
            //         q.Collection('pilot0'),
            //         { data: 
            //             { siteInfo: 
            //                 { title: siteInfo.title,
            //                 url: siteInfo.url,
            //                 qtag: siteInfo.qtag,
            //                 isExactBookmark: siteInfo.isExactBookmark,
            //                 like: siteInfo.like,
            //                 dislike: siteInfo.dislike
            //                 psuedoDeleteFlag: siteInfo.psuedoDeleteFlag
            //                 }
            //             }
            //         }
            //     )
            // );
            // console.log("STEP 5: SUCCESS! newDocument is",newDocument);

        }

    }catch(err){
        console.error('Error while updating the document from topics-overview %s', err);
    }
}
