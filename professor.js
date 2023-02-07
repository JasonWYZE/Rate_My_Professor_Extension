const request = require("request");
const fs = require("fs");
const os = require("os");
const path = require("path");
const datetime = require("datetime");
const bs4 = require("bs4");
const urlopen = require("urlopen");

const total_ordering = require("functools").total_ordering;
const school = require("./school");

const current_path = path.dirname(__filename);
const ratings_query = JSON.parse(fs.readFileSync(path.join(current_path, "json/ratingsquery.json"), 'utf8'));
const professor_query = JSON.parse(fs.readFileSync(path.join(current_path, "json/professorquery.json"), 'utf8'));
const headers = JSON.parse(fs.readFileSync(path.join(current_path, "json/header.json"), 'utf8'));

class Professor {
  /**
   * Represents a professor.
   * @param {int} professor_id - The professor's id.
   */
  constructor(professor_id) {
    this.id = professor_id;
    this.avg_rating = {};
    this._get_rating_info(professor_id);
  }

  _get_rating_info(professor_id) {
    headers.Referer = `https://www.ratemyprofessors?tid=${professor_id}`;
    professor_query.variables.id = Buffer.from(`Teacher-${professor_id}`).toString('base64');
    request.post({
      url: "https://www.ratemyprofessors.com/graphql",
      json: professor_query,
      headers: headers
    }, (error, response, body) => {
      if (error || !body.data || !body.data.node) {
        throw new Error("Professor not found with that id or bad request.");
      }
      const professor_data = body.data.node;
      const courses_data = professor_data.courseCodes;
      this.courses = [];
      for (const course_data of courses_data) {
        this.courses.push(new Course(this, course_data.courseCount, course_data.courseName));
      }
      this.name = `${professor_data.firstName} ${professor_data.lastName}`;
      this.department = professor_data.department;
      this.difficulty = professor_data.avgDifficulty;
      this.rating = professor_data.avgRating;
      if (professor_data.wouldTakeAgainPercent === 0) {
        this.would_take_again = null;
      } else {
        this.would_take_again = professor_data.wouldTakeAgainPercent;
      }
      this.num_ratings = professor_data.numRatings;
      this.school = new school.School(parseInt(Buffer.from(professor_data.school.id, 'base64').toString().slice(7), 10));
    });
  }
}

class Course {
  /**
   * Represents a course.
   * 
   **/

constructor(professor, count, name) {
    /**
     * Initializes a course.
     * @param {Professor} professor - The professor who teaches the course.
     * @param {number} count - The number of ratings for the course.
     * @param {string} name - The name of the course.
     */
    this.professor = professor;
    this.name = name;
    this.count = count;
 }
}