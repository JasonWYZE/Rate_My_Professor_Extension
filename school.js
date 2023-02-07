const request = require("request");
const re = require("re");

class School {
  constructor(schoolId) {
    this.id = schoolId;
    this.name = this.getName();
  }

  getName() {
    const url = `https://www.ratemyprofessors.com/campusRatings.jsp?sid=${this.id}`;
    request(url, (err, res, body) => {
      if (err) {
        throw new Error("Invalid school id or bad request.");
      }
      const schoolNames = re.findall(r'"name":"(.*?)"', body);
      if (schoolNames.length > 0) {
        this.name = schoolNames[0];
      } else {
        throw new Error("Invalid school id or bad request.");
      }
    });
  }
}