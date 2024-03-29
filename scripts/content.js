var obs = new MutationObserver(function (event) {
  var courses = document.getElementsByClassName("gwt-InlineLabel WM5F WL4F");
  Array.from(courses).forEach((selector) => {
    if (selector.textContent.lastIndexOf("Enrolled") == -1) {
      professor = selector.textContent.substring(
        selector.textContent.lastIndexOf("Instructor:") + 11
      );
    } else {
      professor = selector.textContent
        .substring(
          selector.textContent.lastIndexOf("Instructor:") + 11,
          selector.textContent.lastIndexOf("Enrolled") - 5
        )
        .trim();
    }
    const fullName = professor;
    const splitName = fullName.split(" ");
    const firstName = splitName[0].toLowerCase().trim();
    const lastName = splitName.slice(-1)[0].toLowerCase().trim();
    const tryLastName = true;

    GetProfessorRating(selector, fullName, lastName, firstName, tryLastName);
  });
});

function GetProfessorRating(
  element,
  fullName,
  lastName,
  firstName,
  tryLastName
) {
  const schoolName = "Babson+College";
  const urlBase =
    "https://search-production.ratemyprofessors.com/solr/rmp/select/?solrformat=true&rows=2&wt=json&q=";
  url = `${urlBase}${
    firstName ? firstName + "+" : ""
  }${lastName}+AND+schoolname_t:${schoolName}`;
  console.log(url)
  chrome.runtime.sendMessage(url, async function (json) {
    const numFound = json.response.numFound;
    const docs = json.response.docs;
    const schoolId = "U2Nob29sLTcz";

    // U2Nob29sLTcz: School-73
    let doc;

    element.setAttribute("target", "_blank");
    element.classList.add("blueText");
    element.parentElement &&
      element.parentElement.classList.add("classSearchBasicResultsText");

    tryLastName = true;
    // Add professor data if found
    if (numFound > 0) {
      doc = docs[0];
      if (doc && doc.averageratingscore_rf != "0.0") {
        const profID = doc.pk_id;
        
        const realFullName = doc.teacherfullname_s;
        const dept = doc.teacherdepartment_s;
        const profRating =
          doc.averageratingscore_rf && doc.averageratingscore_rf.toFixed(1);
        const numRatings = doc.total_number_of_ratings_i;
        const easyRating =
          doc.averageeasyscore_rf && doc.averageeasyscore_rf.toFixed(1);

        const profURL =
          "http://www.ratemyprofessors.com/ShowRatings.jsp?tid=" + profID;
        const link = document.createElement("a");
        link.textContent = "RMP";
        link.setAttribute("href", profURL);
        if (element.textContent.lastIndexOf("Enrolled") == -1) {
          element.textContent =
            element.textContent.slice(
              0,
              element.textContent.lastIndexOf(fullName) + fullName.length
            ) +
            ` (${profRating})` +
            "   ";
          element.appendChild(link);
        } else {
          element.textContent =
            element.textContent.slice(
              0,
              element.textContent.lastIndexOf(fullName) + fullName.length
            ) +
            ` (${profRating})` +
            element.textContent.slice(
              element.textContent.lastIndexOf("Enrolled") - 5
            ) +
            "   ";
          element.appendChild(link);
        }
        // element.textContent += ` (${profRating ? profRating : 'N/A'})`;

        let allprofRatingsURL =
          "https://www.ratemyprofessors.com/paginate/professors/ratings?tid=" +
          profID +
          "&page=0&max=20";
        AddTooltip(
          element,
          allprofRatingsURL,
          realFullName,
          profRating,
          numRatings,
          easyRating,
          dept
        );
      }
    } else {
      if (tryLastName) {
        tryLastName = false;
        GetProfessorRating(element, fullName, lastName, "");
      } else {
        // Doesn't found the professor
        element.textContent = `${element.textContent} (NF)`;
        element.setAttribute(
          "href",
          `https://www.ratemyprofessors.com/search/teachers?query=${LastName}&sid=${schoolId}`
        );
      }
    }
  });

  return element.textContent;
}

function AddTooltip(
  element,
  allprofRatingsURL,
  realFullName,
  profRating,
  numRatings,
  easyRating,
  dept
) {
  let ratings = [];
  function getRatings(url) {
    chrome.runtime.sendMessage(url, function (json) {
      ratings = ratings.concat(json.ratings);
      var remaining = json.remaining;
      let pageNum = parseInt(new URLSearchParams(url).get("page"));
      if (remaining !== 0) {
        // Get all ratings by going through all the pages
        getRatings(url.replace(`page=${pageNum}`, `page=${pageNum + 1}`));
      } else {
        // Build content for professor tooltip
        let wouldTakeAgain = 0;
        let wouldTakeAgainNACount = 0;
        let mostHelpfulReview;
        let helpCount;
        let notHelpCount;
        let wouldTakeAgainText;
        let easyRatingText;

        const div = document.createElement("div");
        const title = document.createElement("div");
        title.classList.add("prof-rating-title");
        title.textContent = "Rate My Professor Details";
        div.appendChild(title);
        const professorText = document.createElement("div");
        professorText.classList.add("prof-rating-text");
        professorText.textContent = `${realFullName}, Professor in ${dept}`;
        div.appendChild(professorText);
        const avgRatingText = document.createElement("div");
        avgRatingText.classList.add("prof-rating-text");
        avgRatingText.textContent = `Overall Quality: ${
          profRating ? profRating : "N/A"
        }/5`;
        div.appendChild(avgRatingText);
        const numRatingsText = document.createElement("div");
        numRatingsText.classList.add("prof-rating-text");
        numRatingsText.textContent = `Number of Ratings: ${numRatings}`;
        div.appendChild(numRatingsText);

        if (ratings.length > 0) {
          let tagFreqMap = new Map();
          for (let i = 0; i < ratings.length; i++) {
            let rating = ratings[i];
            if (rating.rWouldTakeAgain === "Yes") {
              wouldTakeAgain++;
            } else if (rating.rWouldTakeAgain === "N/A") {
              wouldTakeAgainNACount++;
            }

            let teacherRatingTags = rating.teacherRatingTags;
            for (let j = 0; j < teacherRatingTags.length; j++) {
              let tag = teacherRatingTags[j];
              if (tagFreqMap.get(tag)) {
                tagFreqMap.get(tag).count++;
              } else {
                tagFreqMap.set(tag, { count: 0 });
              }
            }
          }

          ratings.sort(function (a, b) {
            return new Date(b.rDate) - new Date(a.rDate);
          });
          ratings.sort(function (a, b) {
            return (
              b.helpCount - b.notHelpCount - (a.helpCount - a.notHelpCount)
            );
          });
          mostHelpfulReview = ratings[0];
          helpCount = mostHelpfulReview.helpCount;
          notHelpCount = mostHelpfulReview.notHelpCount;

          const topTags = [...tagFreqMap.entries()]
            .sort((a, b) => a.count - b.count)
            .splice(0, 5);
          easyRatingText = document.createElement("div");
          easyRatingText.classList.add("prof-rating-text");
          easyRatingText.textContent = `Level of Difficulty: ${easyRating}`;
          div.appendChild(easyRatingText);
          wouldTakeAgainText = document.createElement("div");
          wouldTakeAgainText.classList.add("prof-rating-text");
          if (
            ratings.length >= 8 &&
            wouldTakeAgainNACount < ratings.length / 2
          ) {
            wouldTakeAgain = `${(
              (wouldTakeAgain / (ratings.length - wouldTakeAgainNACount)) *
              100
            )
              .toFixed(0)
              .toString()}%`;
          } else {
            wouldTakeAgain = "N/A";
          }
          wouldTakeAgainText.textContent =
            "Would take again: " + wouldTakeAgain;
          div.appendChild(wouldTakeAgainText);
          const topTagsText = document.createElement("div");
          topTagsText.classList.add("prof-rating-text");
          topTagsText.textContent = "Top Tags: ";
          if (topTags.length > 0) {
            for (let i = 0; i < topTags.length; i++) {
              let tag = topTags[i][0];
              topTagsText.textContent += `${tag}${
                i !== topTags.length - 1 ? ", " : ""
              }`;
            }
            div.appendChild(topTagsText);
          }
          div.appendChild(document.createElement("br"));
        }
        if (mostHelpfulReview) {
          const classText = document.createElement("div");
          classText.classList.add("prof-rating-text");
          classText.textContent =
            "Most Helpful Rating: " +
            mostHelpfulReview.rClass +
            (mostHelpfulReview.onlineClass === "online" ? " (Online)" : ""); // Mark if class was online
          div.appendChild(classText);
          const dateText = document.createElement("div");
          dateText.classList.add("prof-rating-text");
          dateText.textContent = mostHelpfulReview.rDate;
          div.appendChild(dateText);
          const profRating = document.createElement("div");
          profRating.classList.add("prof-rating-text");
          profRating.textContent =
            "Overall Quality: " + mostHelpfulReview.rOverallString;
          div.appendChild(profRating);
          const thisEasyRating = document.createElement("div");
          thisEasyRating.classList.add("prof-rating-text");
          thisEasyRating.textContent =
            "Level of Difficulty: " + mostHelpfulReview.rEasyString;
          div.appendChild(thisEasyRating);
          if (mostHelpfulReview.rWouldTakeAgain !== "N/A") {
            const thisWouldTakeAgain = document.createElement("div");
            thisWouldTakeAgain.classList.add("prof-rating-text");
            thisWouldTakeAgain.textContent =
              "Would take again: " + mostHelpfulReview.rWouldTakeAgain;
            div.appendChild(thisWouldTakeAgain);
          }
          const commentText = document.createElement("div");
          commentText.classList.add("prof-rating-text");
          commentText.textContent = mostHelpfulReview.rComments;
          div.appendChild(commentText);
          const tagsText = document.createElement("div");
          tagsText.classList.add("prof-rating-text");
          tagsText.textContent = "Tags: ";
          const tags = mostHelpfulReview.teacherRatingTags;
          if (tags.length > 0) {
            for (let i = 0; i < tags.length; i++) {
              let tag = tags[i];
              tagsText.textContent += `${tag}${
                i !== tags.length - 1 ? ", " : ""
              }`;
            }
            div.appendChild(tagsText);
          }
          const upvotesText = document.createElement("div");
          upvotesText.classList.add("prof-rating-text");
          upvotesText.textContent = `👍${helpCount} 👎${notHelpCount}`;
          div.appendChild(upvotesText);
        }
        tippy(element, {
          theme: "light",
          allowHTML: true,
          placement: "top-start",
          // show delay is 500ms, hide delay is 0ms
          delay: [500, 0],
          onShow: function (instance) {
            instance.setContent(div);
          },
        });
      }
    });
  }
  getRatings(allprofRatingsURL);
}

obs.observe(document.body, {
  childList: true,
  
  attributes: true,
});
