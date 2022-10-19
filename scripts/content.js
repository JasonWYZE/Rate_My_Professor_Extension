



// var obs = new MutationObserver(function(event) {
//   // console.log(document.getElementById('gwt-uid-4'))

//   var courses = document.getElementsByClassName('gwt-InlineLabel WL5F WK4F');
//   if(courses){
//     console.log(courses[0].textContent);
//     courses[0].textContent = "INTRODUCTION TO FINANCIAL ACCOUNTING   |   Full Session   |   Open   |   Credits: 4.00   |   Instructor: Shay Blanchette Proulx (4/5)   |   Enrolled/Capacity: 0/38"

//   }
// });
// obs.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });




// var obs = new MutationObserver(function(event) 
// {
//   var courses = document.getElementsByClassName('gwt-InlineLabel WL5F WK4F');
//   Array.from(courses).forEach(selector => 
//     {

//         const professor = selector.textContent.substring(
//             selector.textContent.lastIndexOf("Instructor:") + 11, 
//             selector.textContent.lastIndexOf("Enrolled")-5).trim();

//         console.log(professor)
//     });
// })

// obs.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });



// professor_id = btoa("Teacher-2386143")
// query = {
//     query:"query RatingsListQuery($id: ID!) {node(id: $id) {... on Teacher {school {id} courseCodes {courseName courseCount} firstName lastName numRatings avgDifficulty avgRating department wouldTakeAgainPercent}}}",
//     variables: { } 
// }
// query['variables']['id'] = professor_id

// fetch('https://www.ratemyprofessors.com/graphql', {
//   method: 'POST', // or 'PUT'
//   mode: 'cors',
//   headers: {
//     'Content-Type': 'application/json',
//     'Authorization' : 'Basic dGVzdDp0ZXN0',
//     'Access-Control-Allow-Methdos': 'POST',
//     'Referer' : 'https://www.ratemyprofessors.com/ShowRatings.jsp?tid=2386143' 
//   },
//   body: JSON.stringify(query),
// }).then((data) => {
//         console.log(data)
//     });



const xhr = new XMLHttpRequest()

// listen for `load` event
xhr.onload = () => {
  // print JSON response
  if (xhr.status >= 200 && xhr.status < 300) {
    // parse JSON
    const response = JSON.parse(xhr.responseText)
    console.log(response)
  }
}

// create a JSON object
json = {
    query:"query RatingsListQuery($id: ID!) {node(id: $id) {... on Teacher {school {id} courseCodes {courseName courseCount} firstName lastName numRatings avgDifficulty avgRating department wouldTakeAgainPercent}}}",
    variables: { } 
}
professor_id = btoa("Teacher-2386143")
json['variables']['id'] = professor_id

// open request
xhr.open('POST', 'https://www.ratemyprofessors.com/graphql')

// set `Content-Type` header
xhr.setRequestHeader('Content-Type', 'application/json')
xhr.setRequestHeader('Authorization', 'Basic dGVzdDp0ZXN0')
xhr.setRequestHeader('Referer', 'https://www.ratemyprofessors.com/ShowRatings.jsp?tid=2386143')


// send rquest with JSON payload
xhr.send(JSON.stringify(json))

