// const article = document.querySelector("article");

// // `document.querySelector` may return null if the selector doesn't match anything.
// if (article) {
//   const text = article.textContent;
//   const wordMatchRegExp = /[^\s]+/g; // Regular expression
//   const words = text.matchAll(wordMatchRegExp);
//   // matchAll returns an iterator, convert to array to get word count
//   const wordCount = [...words].length;
//   const readingTime = Math.round(wordCount / 200);
//   const badge = document.createElement("p");
//   // Use the same styling as the publish information in an article's header
//   badge.classList.add("color-secondary-text", "type--caption");
//   badge.textContent = `⏱️ ${readingTime} min read`;

//   // Support for API reference docs
//   const heading = article.querySelector("h1");
//   // Support for article docs with date
//   const date = article.querySelector("time")?.parentNode;

//   (date ?? heading).insertAdjacentElement("afterend", badge);
// }



// Course_listing = document.getElementsByClassName("WHLO WLKO")[0].getElementsByTagName("li")[0].getElementsByClassName("gwt-InlineLabel WG5F WF4F");


// document.addEventListener("load", function(event) {
//   console.log(document.getElementById('gwt-uid-4'))

//   var courses = document.getElementsByClassName('gwt-InlineLabel WG5F WF4F');
//   if(courses){
//     console.log(courses.length);
//     console.log(courses[0]);
//     console.log(courses[0].textContent);
//   }
//   else{
//     console.log("Null");
//   }
// });



// var obs = new MutationObserver(function(event) {
//   // console.log(document.getElementById('gwt-uid-4'))

//   var courses = document.getElementsByClassName('gwt-InlineLabel WL5F WK4F');
//   if(courses){
//     console.log(courses[0].textContent);
//     courses[0].textContent = "INTRODUCTION TO FINANCIAL ACCOUNTING   |   Full Session   |   Open   |   Credits: 4.00   |   Instructor: Shay Blanchette Proulx (4/5)   |   Enrolled/Capacity: 0/38"

//   }
// });
// obs.observe(document.body, { childList: true, subtree: true, attributes: false, characterData: false });

