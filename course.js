const fs = require("fs");
const requests = require("requests");
const BeautifulSoup = require("bs4").BeautifulSoup;
const urlopen = require("urllib").request.urlopen;

const currentPath = __dirname;
const ratingsQuery = JSON.parse(fs.readFileSync(`${currentPath}/json/ratingsquery.json`, "utf-8"));
const professorQuery = JSON.parse(fs.readFileSync(`${currentPath}/json/professorquery.json`, "utf-8"));
const headers = JSON.parse(fs.readFileSync(`${currentPath}/json/header.json`, "utf-8"));


class Course{
    /**
     * Represents a course.
     * @constructor
     * @param {Object} professor - The professor object, referring to which professor is teaching this course.
     * @param {string} course_name - The name of the course.
     */
    constructor(professor, course_name) {
      this.course_name = course_name;
  
      /**
       * A list of tags associated with the course.
       * @type {Array}
       */
      this.tagList = [];
  
      /**
       * The helpful rating of the course.
       * @type {number}
       */
      this.helpfulRating = 0;
  
      /**
       * The difficulty rating of the course.
       * @type {number}
       */
      this.difficultyRating = 0;
  
      /**
       * The rating of the course.
       * @type {number}
       */
      this.rating = this.get_rating(professor, course_name);
    }


    get_rating(professor, courseName){
        if (professor.numRatings === 0) {
            return [];
          }
          
          headers["Referer"] = `https://www.ratemyprofessors.com/professor?tid=${professor.id}`;
          ratingsQuery["variables"]["id"] = btoa(`Teacher-${professor.id}`);
          ratingsQuery["variables"]["count"] = professor.numRatings;
        
          if (courseName !== undefined) {
            let courseFound = false;
            for (let course of professor.courses) {
              if (course.name === courseName) {
                courseFound = true;
              }
            }
            
            if (!courseFound) {
              return [];
            } else {
              ratingsQuery["variables"]["courseFilter"] = courseName;
            }
          }
          
          let data = await post(`https://www.ratemyprofessors.com/graphql`, JSON.stringify(ratingsQuery), headers);
          
          if (!data || !data.data || !data.data.node || !data.data.node.ratings || !data.data.node.ratings.edges) {
            return [];
          }


          let ratingsData = data.data.node.ratings.edges;
          let ratings = [];
        
          if (courseName) {
            ratingsData = ratingsData.filter(ratingData => ratingData.node.class === courseName);
          }
        
          let tagList = [];
          let totalDifficultyRating = 0;
          let totalHelpfulRating = 0;
          let mostRecentComment = ratingsData[0].node.comment;
        
          for (let ratingData of ratingsData) {
            let rating = ratingData.node;
            let temp = rating.ratingTags.split("--");
            for (let i of temp) {
              tagList.push(i);
            }
        
            let attendanceMandatory;
            if (rating.attendanceMandatory === "non mandatory") {
              attendanceMandatory = false;
            } else if (rating.attendanceMandatory === "mandatory") {
              attendanceMandatory = true;
            } else {
              attendanceMandatory = undefined;
            }
        
            let credit;
            if (rating.isForCredit === false) {
              credit = false;
            } else if (rating.isForCredit === true) {
              credit = true;
            } else {
              credit = undefined;
            }
        
            let onlineClass;
            if (rating.isForOnlineClass === false) {
              onlineClass = false;
            } else if (rating.isForOnlineClass === true) {
              onlineClass = true;
            } else {
              onlineClass = undefined;
            }
        
            let takeAgain;
            if (rating.wouldTakeAgain === 1) {
              takeAgain = true;
            } else if (rating.wouldTakeAgain === 0) {
              takeAgain = false;
            } else {
              takeAgain = undefined;
            }
        
            totalDifficultyRating += rating.difficultyRating;
            totalHelpfulRating += rating.helpfulRating;

            let date = new Date(rating["date"].substring(0, 19));

            ratings.push({
            rating: rating["helpfulRating"],
            difficulty: rating["difficultyRating"],
            comment: rating["comment"],
            className: rating["class"],
            date: date,
            takeAgain: takeAgain,
            grade: rating["grade"],
            thumbsUp: rating["thumbsUpTotal"],
            thumbsDown: rating["thumbsDownTotal"],
            onlineClass: onlineClass,
            credit: credit,
            attendanceMandatory: attendanceMandatory
            });

        this.mostRecentComment = mostRecentComment;

        let tagList = Array.from(new Set(tagList)).sort();
        while (tagList.includes("")) {
        tagList.splice(tagList.indexOf(""), 1);
        }
        this.tagList = tagList;
        this.difficultyRating = (TotaldifficultyRating / ratingsData.length).toFixed(2);
        this.helpfulRating = (TotalHelpfulRating / ratingsData.length).toFixed(2);

        return ratings;

    }

  }
}

class Rating {
    /**
    Initializes a rating.
    Note that some fields may be None, and that you may be required to check if those are None.
    :param rating: The rating number.
    :param difficulty: The difficulty rating.
    :param comment: The rating comment.
    :param class_name: The class the rating was for.
    :param date: The date the rating was made.
    :param take_again: If the person who made the rating would take the class again, if any
    :param grade: The grade of the person who made the rating, if any
    :param thumbs_up: The number of thumbs up for the rating
    :param thumbs_down: The number of thumbs down for the rating
    :param online_class: If the rating is for an online class, if any
    :param credit: If the rating was for credit, if any
    :param attendance_mandatory: If attendance was mandatory for the class, if any
    **/

    constructor(rating, difficulty, comment, class_name, date, take_again = null, grade = null, thumbs_up = 0, thumbs_down = 0, online_class = null, credit = null, attendance_mandatory = null) {
      this.rating = rating;
      this.difficulty = difficulty;
      this.comment = new DOMParser().parseFromString(comment, "text/html").body.textContent;
      this.class_name = class_name;
      this.date = date;
      this.take_again = take_again;
      this.grade = grade;
      this.thumbs_up = thumbs_up;
      this.thumbs_down = thumbs_down;
      this.online_class = online_class;
      this.credit = credit;
      this.attendance_mandatory = attendance_mandatory;
    }
  }