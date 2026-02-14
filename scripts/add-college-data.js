
const fs = require('fs');
const path = require('path');

const collegeModelPath = path.join(__dirname, '..', 'models', 'CollegeModel.js');
const newCollegesPath = path.join(__dirname, '..', 'tmp', 'new-college-data.json');

// Read the CollegeModel.js file
fs.readFile(collegeModelPath, 'utf8', (err, data) => {
  if (err) {
    console.error(`Error reading CollegeModel.js: ${err}`);
    return;
  }

  // Find the start and end of the colleges array
  const collegesArrayStart = data.indexOf('const colleges = [');
  const collegesArrayEnd = data.lastIndexOf('];');

  if (collegesArrayStart === -1 || collegesArrayEnd === -1) {
    console.error('Could not find the colleges array in CollegeModel.js');
    return;
  }

  // Extract the existing colleges array string
  const existingCollegesString = data.substring(collegesArrayStart, collegesArrayEnd + 2);

  // Read the new colleges data
  fs.readFile(newCollegesPath, 'utf8', (err, newData) => {
    if (err) {
      console.error(`Error reading new-college-data.json: ${err}`);
      return;
    }

    const newColleges = JSON.parse(newData);

    // Find the highest existing ID
    const existingColleges = eval(existingCollegesString);
    const maxId = existingColleges.reduce((max, college) => Math.max(max, college.id), 0);

    // Transform and append the new colleges
    const transformedColleges = newColleges.map((college, index) => {
        const tierMatch = college.tier.match(/\d+/);
        const tier = tierMatch ? parseInt(tierMatch[0]) : null;

      return {
        id: maxId + index + 1,
        name: college.name,
        tier: tier,
        aliases: college.alias.map(a => a.toLowerCase()),
        location: `${college.location.city}, ${college.location.state}`,
        website: college.contact_info.website,
        placement: {
          average_package: college.avg_package.total,
          placement_percentage: college.recruitment_stats.placement_rate,
        },
        admission: {
          cat_cutoff_general: college.academics.cutoff_percentile,
          avg_gpa: null,
        },
        fees: {
          total_fees: null,
          duration_months: college.academics.program_duration_months,
        },
      };
    });

    // Combine old and new
    const allColleges = existingColleges.concat(transformedColleges);

    // Create the new array string
    const newCollegesString = `const colleges = ${JSON.stringify(allColleges, null, 2)};`;

    // Replace the old array with the new one
    const updatedData = data.replace(existingCollegesString, newCollegesString);

    // Write the updated content back to CollegeModel.js
    fs.writeFile(collegeModelPath, updatedData, 'utf8', (err) => {
      if (err) {
        console.error(`Error writing to CollegeModel.js: ${err}`);
        return;
      }
      console.log('Successfully added new college data to CollegeModel.js');
    });
  });
});
