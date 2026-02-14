/**
 * College Model
 * Database schema and operations for colleges
 */

const db = require('../config/db');

class CollegeModel {
  /**
   * Find all colleges
   */
  static async findAll() {
    const database = db.getDB();
    const colleges = await database.collection('colleges').find({}).toArray();
    return colleges;
  }

  /**
   * Find college by ID
   */
  static async findById(id) {
    const database = db.getDB();
    const college = await database.collection('colleges').findOne({ _id: id });
    return college;
  }

  /**
   * Find college by name (exact or fuzzy)
   */
  static async findByName(name) {
    const database = db.getDB();
    // Try exact match first
    let college = await database.collection('colleges').findOne({ 
      name: { $regex: name, $options: 'i' } 
    });
    return college;
  }

  /**
   * Update placement statistics for a college
   */
  static async updatePlacementData(collegeName, placementData) {
    const database = db.getDB();
    const result = await database.collection('colleges').updateOne(
      { name: collegeName },
      {
        $set: {
          placement: {
            average_package: placementData.average_package || null,
            median_package: placementData.median_package || null,
            max_package: placementData.max_package || null,
            min_package: placementData.min_package || null,
            placement_percentage: placementData.placement_percentage || null,
            total_placed: placementData.total_placed || null,
            total_students: placementData.total_students || null,
            highest_package: placementData.highest_package || null,
            internship_stipend: placementData.internship_stipend || null,
            top_recruiters: placementData.top_recruiters || [],
            sector_distribution: placementData.sector_distribution || {},
            updated_at: new Date()
          }
        }
      }
    );
    return result;
  }

  /**
   * Update admission & cutoff data for a college
   */
  static async updateAdmissionData(collegeName, admissionData) {
    const database = db.getDB();
    const result = await database.collection('colleges').updateOne(
      { name: collegeName },
      {
        $set: {
          admission: {
            cat_cutoff_general: admissionData.cat_cutoff_general || null,
            cat_cutoff_sc: admissionData.cat_cutoff_sc || null,
            cat_cutoff_st: admissionData.cat_cutoff_st || null,
            cat_cutoff_obc: admissionData.cat_cutoff_obc || null,
            avg_gpa: admissionData.avg_gpa || null,
            avg_work_ex: admissionData.avg_work_ex || null,
            batch_size: admissionData.batch_size || null,
            application_process: admissionData.application_process || null,
            updated_at: new Date()
          }
        }
      }
    );
    return result;
  }

  /**
   * Update fees data for a college
   */
  static async updateFeesData(collegeName, feesData) {
    const database = db.getDB();
    const result = await database.collection('colleges').updateOne(
      { name: collegeName },
      {
        $set: {
          fees: {
            total_fees: feesData.total_fees || null,
            annual_fees: feesData.annual_fees || null,
            tuition_fees: feesData.tuition_fees || null,
            placement_guarantee: feesData.placement_guarantee || null,
            duration_months: feesData.duration_months || 24,
            currency: feesData.currency || 'INR',
            updated_at: new Date()
          }
        }
      }
    );
    return result;
  }

  /**
   * Update program-specific data
   */
  static async updateProgramData(collegeName, programData) {
    const database = db.getDB();
    const result = await database.collection('colleges').updateOne(
      { name: collegeName },
      {
        $set: {
          programs: programData.programs || [],
          location: programData.location || null,
          website: programData.website || null,
          alumni_count: programData.alumni_count || null,
          rating: programData.rating || null,
          nirf_rank: programData.nirf_rank || null,
          updated_at: new Date()
        }
      }
    );
    return result;
  }

  /**
   * Seed default colleges
   */
  static async seedColleges() {
    const database = db.getDB();
    const collegesCollection = database.collection('colleges');
    const existing = await collegesCollection.countDocuments();
    
    if (existing > 0) {
      console.log(`   ✓ ${existing} colleges already seeded`);
      return;
    }

    const colleges = [
      // --- TIER 1: Top tier colleges ---
      { 
        id: 1, 
        name: 'IIM Ahmedabad', 
        tier: 1, 
        aliases: ['iim a', 'iim-a', 'iima', 'ahmedabad', 'iim amd'],
        location: 'Ahmedabad, Gujarat',
        website: 'https://www.iima.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 2, 
        name: 'IIM Bangalore', 
        tier: 1, 
        aliases: ['iim b', 'iim-b', 'iimb', 'bangalore', 'iim blr'],
        location: 'Bangalore, Karnataka',
        website: 'https://www.iimb.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 3, 
        name: 'IIM Calcutta', 
        tier: 1, 
        aliases: ['iim c', 'iim-c', 'iimc', 'joka', 'cal c', 'calcutta', 'kolkata'],
        location: 'Kolkata, West Bengal',
        website: 'https://www.iimcal.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 4, 
        name: 'IIM Lucknow', 
        tier: 1, 
        aliases: ['iim l', 'iim-l', 'iiml', 'lucknow', 'iim lko'],
        location: 'Lucknow, Uttar Pradesh',
        website: 'https://www.iiml.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 5, 
        name: 'IIM Kozhikode', 
        tier: 1, 
        aliases: ['iim k', 'iim-k', 'iimk', 'kozhikode', 'calicut'],
        location: 'Kozhikode, Kerala',
        website: 'https://www.iimk.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 6, 
        name: 'IIM Indore', 
        tier: 1, 
        aliases: ['iim i', 'iim-i', 'iimi', 'indore', 'iim ind'],
        location: 'Indore, Madhya Pradesh',
        website: 'https://www.iimidr.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 7, 
        name: 'XLRI Jamshedpur', 
        tier: 1, 
        aliases: ['xlri', 'xlri jamshedpur', 'xlri jsr', 'xl', 'xlri j'],
        location: 'Jamshedpur, Jharkhand',
        website: 'https://www.xlri.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 8, 
        name: 'XLRI Delhi', 
        tier: 1, 
        aliases: ['xlri delhi', 'xlri ncr', 'xlri d'],
        location: 'New Delhi, Delhi',
        website: 'https://www.xlri.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 9, 
        name: 'FMS Delhi', 
        tier: 1, 
        aliases: ['fms', 'fms delhi', 'delhi fms'],
        location: 'New Delhi, Delhi',
        website: 'https://www.fms.edu',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 10, 
        name: 'SPJIMR Mumbai', 
        tier: 1, 
        aliases: ['spjimr', 'sp jain', 'spj', 'sp', 'spjimr mumbai'],
        location: 'Mumbai, Maharashtra',
        website: 'https://www.spjimr.org',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 11, 
        name: 'ISB Hyderabad', 
        tier: 1, 
        aliases: ['isb', 'isb hyderabad', 'isb hyd'],
        location: 'Hyderabad, Telangana',
        website: 'https://www.isb.edu',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 12, 
        name: 'ISB Mohali', 
        tier: 1, 
        aliases: ['isb mohali', 'isb chandigarh'],
        location: 'Mohali, Punjab',
        website: 'https://www.isb.edu',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 13, 
        name: 'JBIMS Mumbai', 
        tier: 1, 
        aliases: ['jbims', 'jb', 'jamnalal bajaj', 'jbims mumbai'],
        location: 'Mumbai, Maharashtra',
        website: 'https://www.jbimsr.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 14, 
        name: 'IIM Mumbai', 
        tier: 1, 
        aliases: ['iim mumbai', 'iim m', 'nitie', 'iim mum'],
        location: 'Mumbai, Maharashtra',
        website: 'https://www.iimumbai.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 15, 
        name: 'MDI Gurgaon', 
        tier: 1, 
        aliases: ['mdi', 'mdi g', 'mdi gurgaon', 'mdi delhi'],
        location: 'Gurgaon, Haryana',
        website: 'https://www.mdi.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 16, 
        name: 'IIFT Delhi', 
        tier: 1, 
        aliases: ['iift', 'iift delhi', 'iift d', 'iift new delhi'],
        location: 'New Delhi, Delhi',
        website: 'https://www.iift.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 17, 
        name: 'IIFT Kolkata', 
        tier: 1, 
        aliases: ['iift kolkata', 'iift k', 'iift cal'],
        location: 'Kolkata, West Bengal',
        website: 'https://www.iift.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 18, 
        name: 'IIM Shillong', 
        tier: 1, 
        aliases: ['iim s', 'iim shillong', 'shillong'],
        location: 'Shillong, Meghalaya',
        website: 'https://www.iimshillong.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 19, 
        name: 'TISS Mumbai', 
        tier: 1, 
        aliases: ['tiss', 'tiss mumbai', 'tata institute'],
        location: 'Mumbai, Maharashtra',
        website: 'https://www.tiss.edu',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 20, 
        name: 'SJMSOM IIT Bombay', 
        tier: 1, 
        aliases: ['sjmsom', 'iit b mba', 'iit bombay mba', 'iit b'],
        location: 'Mumbai, Maharashtra',
        website: 'https://www.iitb.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },
      { 
        id: 21, 
        name: 'DMS IIT Delhi', 
        tier: 1, 
        aliases: ['dms iitd', 'iit delhi mba', 'iit d mba'],
        location: 'New Delhi, Delhi',
        website: 'https://www.iitd.ac.in',
        placement: { average_package: null, placement_percentage: null },
        admission: { cat_cutoff_general: null, avg_gpa: null },
        fees: { total_fees: null, duration_months: 24 }
      },

      // --- TIER 2: Mid tier colleges ---
      { id: 22, name: 'NMIMS Mumbai', tier: 2, aliases: ['nmims', 'nmims mumbai', 'nm', 'nm mumbai'], location: 'Mumbai, Maharashtra', website: 'https://www.nmims.edu', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 23, name: 'SIBM Pune', tier: 2, aliases: ['sibm', 'sibm pune', 'sibm p'], location: 'Pune, Maharashtra', website: 'https://www.sibm.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 24, name: 'SCMHRD Pune', tier: 2, aliases: ['scmhrd', 'scm', 'scmhrd pune'], location: 'Pune, Maharashtra', website: 'https://www.scmhrd.edu', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 25, name: 'IIM Udaipur', tier: 2, aliases: ['iim u', 'iimu', 'udaipur'], location: 'Udaipur, Rajasthan', website: 'https://www.iimu.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 26, name: 'IIM Trichy', tier: 2, aliases: ['iim t', 'iimt', 'trichy', 'iim trichy'], location: 'Trichy, Tamil Nadu', website: 'https://www.iimtrichy.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 27, name: 'IIM Ranchi', tier: 2, aliases: ['iim r', 'iim ranchi', 'ranchi'], location: 'Ranchi, Jharkhand', website: 'https://www.iimranchi.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 28, name: 'IIM Raipur', tier: 2, aliases: ['iim raipur', 'raipur'], location: 'Raipur, Chhattisgarh', website: 'https://www.iimraipur.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 29, name: 'IIM Rohtak', tier: 2, aliases: ['iim rohtak', 'rohtak'], location: 'Rohtak, Haryana', website: 'https://www.iimrohtak.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 30, name: 'IIM Kashipur', tier: 2, aliases: ['iim kashipur', 'kashipur'], location: 'Kashipur, Uttarakhand', website: 'https://www.iimkashipur.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 31, name: 'XIMB Bhubaneswar', tier: 2, aliases: ['ximb', 'xim b', 'xim', 'xim bhubaneswar'], location: 'Bhubaneswar, Odisha', website: 'https://www.ximb.edu.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 32, name: 'IMT Ghaziabad', tier: 2, aliases: ['imt', 'imt g', 'imt ghaziabad'], location: 'Ghaziabad, Uttar Pradesh', website: 'https://www.imtghaziabad.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 33, name: 'IMI Delhi', tier: 2, aliases: ['imi', 'imi delhi'], location: 'New Delhi, Delhi', website: 'https://www.imidel.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 34, name: 'MICA Ahmedabad', tier: 2, aliases: ['mica', 'mica ahmedabad'], location: 'Ahmedabad, Gujarat', website: 'https://www.mica.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 35, name: 'IRMA Anand', tier: 2, aliases: ['irma', 'irma anand'], location: 'Anand, Gujarat', website: 'https://www.irma.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 36, name: 'VGSOM IIT Kharagpur', tier: 2, aliases: ['vgsom', 'iit kgp mba', 'iit kharagpur mba'], location: 'Kharagpur, West Bengal', website: 'https://www.iitkgp.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 37, name: 'DoMS IIT Madras', tier: 2, aliases: ['doms iitm', 'iit madras mba', 'iit m mba'], location: 'Chennai, Tamil Nadu', website: 'https://www.iitm.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 38, name: 'IME IIT Kanpur', tier: 2, aliases: ['ime iitk', 'iit kanpur mba'], location: 'Kanpur, Uttar Pradesh', website: 'https://www.iitk.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 39, name: 'DoMS IIT Roorkee', tier: 2, aliases: ['doms iitr', 'iit roorkee mba'], location: 'Roorkee, Uttarakhand', website: 'https://www.iitr.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },

      // --- TIER 3: Other notable colleges ---
      { id: 40, name: 'IIM Amritsar', tier: 3, aliases: ['iim amritsar', 'amritsar'], location: 'Amritsar, Punjab', website: 'https://www.iimamritsar.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 41, name: 'IIM Nagpur', tier: 3, aliases: ['iim nagpur', 'iimn', 'nagpur'], location: 'Nagpur, Maharashtra', website: 'https://www.iimnagpur.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 42, name: 'IIM Visakhapatnam', tier: 3, aliases: ['iim vizag', 'iim visakhapatnam', 'iim v'], location: 'Visakhapatnam, Andhra Pradesh', website: 'https://www.iimvizag.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 43, name: 'IIM Bodh Gaya', tier: 3, aliases: ['iim bodh gaya', 'iim bg', 'bodh gaya'], location: 'Bodh Gaya, Bihar', website: 'https://www.iimbodha.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 44, name: 'IIM Jammu', tier: 3, aliases: ['iim jammu', 'iim j'], location: 'Jammu, Jammu & Kashmir', website: 'https://www.iimjammu.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 45, name: 'IIM Sambalpur', tier: 3, aliases: ['iim sambalpur', 'iim sambal'], location: 'Sambalpur, Odisha', website: 'https://www.iimsambalpur.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 46, name: 'IIM Sirmaur', tier: 3, aliases: ['iim sirmaur'], location: 'Sirmaur, Himachal Pradesh', website: 'https://www.iimsirmaur.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 47, name: 'GIM Goa', tier: 3, aliases: ['gim', 'gim goa'], location: 'Goa', website: 'https://www.gimgoa.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 48, name: 'TAPMI Manipal', tier: 3, aliases: ['tapmi', 'tapmi manipal'], location: 'Manipal, Karnataka', website: 'https://www.tapmi.edu.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 49, name: 'GLIM Chennai', tier: 3, aliases: ['glim', 'glim c', 'glim chennai', 'great lakes'], location: 'Chennai, Tamil Nadu', website: 'https://www.greatlakes.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 50, name: 'GLIM Gurgaon', tier: 3, aliases: ['glim g', 'glim gurgaon'], location: 'Gurgaon, Haryana', website: 'https://www.greatlakes.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 51, name: 'FORE Delhi', tier: 3, aliases: ['fore', 'fore delhi'], location: 'New Delhi, Delhi', website: 'https://www.fore.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 52, name: 'KJ Somaiya Mumbai', tier: 3, aliases: ['kj somaiya', 'kj', 'kjsim'], location: 'Mumbai, Maharashtra', website: 'https://www.somaiya.edu', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 53, name: 'Welingkar Mumbai', tier: 3, aliases: ['weschool', 'welingkar', 'welingkar mumbai'], location: 'Mumbai, Maharashtra', website: 'https://www.welingkar.org', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 54, name: 'Welingkar Bangalore', tier: 3, aliases: ['weschool blr', 'welingkar bangalore'], location: 'Bangalore, Karnataka', website: 'https://www.welingkar.org', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 55, name: 'SIIB Pune', tier: 3, aliases: ['siib', 'siib pune'], location: 'Pune, Maharashtra', website: 'https://www.siib.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 56, name: 'SIBM Bangalore', tier: 3, aliases: ['sibm b', 'sibm bangalore', 'sibm blr'], location: 'Bangalore, Karnataka', website: 'https://www.sibm.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 57, name: 'NMIMS Bangalore', tier: 3, aliases: ['nmims b', 'nmims blr', 'nm bangalore'], location: 'Bangalore, Karnataka', website: 'https://www.nmims.edu', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 58, name: 'NMIMS Hyderabad', tier: 3, aliases: ['nmims h', 'nm hyderabad', 'nm hyd'], location: 'Hyderabad, Telangana', website: 'https://www.nmims.edu', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 59, name: 'NMIMS Indore', tier: 3, aliases: ['nmims i', 'nm indore'], location: 'Indore, Madhya Pradesh', website: 'https://www.nmims.edu', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 60, name: 'UBS Chandigarh', tier: 3, aliases: ['ubs', 'ubs chandigarh'], location: 'Chandigarh', website: 'https://www.ubsuniversity.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 61, name: 'SRCC GBO', tier: 3, aliases: ['srcc gbo', 'srcc'], location: 'New Delhi, Delhi', website: 'https://www.srcc.du.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 62, name: 'IIT Jodhpur', tier: 3, aliases: ['iit jodhpur mba', 'iitj mba'], location: 'Jodhpur, Rajasthan', website: 'https://www.iitj.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
      { id: 63, name: 'ISM Dhanbad', tier: 3, aliases: ['ism dhanbad', 'iit dhanbad mba'], location: 'Dhanbad, Jharkhand', website: 'https://www.ismdhanbad.ac.in', placement: { average_package: null, placement_percentage: null }, admission: { cat_cutoff_general: null, avg_gpa: null }, fees: { total_fees: null, duration_months: 24 } },
    ];

    await collegesCollection.insertMany(colleges);
    console.log(`   ✓ Seeded ${colleges.length} colleges (Tier 1: 21, Tier 2: 18, Tier 3: 24)`);
  }
}

module.exports = CollegeModel;
