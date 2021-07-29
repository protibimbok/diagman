import jsonData from "./components/records.js";
var PouchDB = require("pouchdb-node");

var db = new PouchDB("records.db");
var stagedDB = new PouchDB("staged.db");

export const seedStaged = () => {
  try {
    stagedDB.bulkDocs([
      {
        _id: "00015",
        date: "06-01-2020",
        patientName: "Mrs Sumi Begum",
        age: "25 years",
        referer: "Prof. / Dr: Kamol Krisna Pramanik, MBBS, FCPS",
        specimen: "Right cervical lymph node",
      },
      {
        _id: "00016",
        date: "07-01-2020",
        patientName: "Mr Kalu Shah",
        age: "26 years",
        referer: "Prof. / Dr: CGH",
        specimen: "Left arm swelling",
      },
      {
        _id: "00017",
        date: "08-01-2020",
        patientName: "Mr Anisur Rahman",
        age: "28 years",
        referer: "Prof. / Dr: Rokeya Begum, MBBS, FCPS, MS",
        specimen: "Both testes for spermatogenesis",
      },
      {
        _id: "00018",
        date: "08-01-2020",
        patientName: "Mr Sujit Sinha",
        age: "41 years",
        referer: "Prof. / Dr: Rokeya Begum, MBBS, FCPS, MS",
        specimen: "Both testes for spermatogenesis",
      },
      {
        _id: "00019",
        date: "08-01-2020",
        patientName: "Md Rashed",
        age: "31 years",
        referer: "Prof. / Dr: Pratik Chowdhury, MBBS, FCPS",
        specimen:
          "Right axillary swelling (USG guided FNA)USG guide: Professor Dr. Subash Mazumder, MBBS, BCS, MD : Professor & Head, R&I Dept, CMCH",
      },
      {
        _id: "00020",
        date: "08-01-2020",
        patientName: "Mr Tobiullah Mollah",
        age: "60 years",
        referer: "Prof. / Dr: Md Jashim Uddin, MBBS, FCPS(Medicine)",
        specimen:
          "Hepatic mass (USG guided)USG guide: Professor Dr. Subash Mazumder, MBBS, BCS, MD: Professor & Head, R&I Dept, CMCH",
      },
      {
        _id: "00021",
        date: "09-01-2020",
        patientName: "Mrs Minu",
        age: "29 years",
        referer: "Prof. / Dr: CGH",
        specimen: "Right breast lump",
      },
    ]);
  } catch (error) {
    console.log(error);
  }
};

export const seedDatabase = () => {
  for (let i = 0; i < jsonData.length; i++) {
    db.put(jsonData[i]).catch((error) => {
      console.log(error);
    });
  }
};

export const printDB = () => {
  db.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      console.log(result.rows[i].doc);
    }
  });
};

export const clearDB = () => {
  db.allDocs({ include_docs: true }).then((result) => {
    for (let i = 0; i < result.rows.length; i++) {
      db.remove(result.rows[i].doc);
    }
  });
};

export const updateRecord = async (record) => {
  const getRev = async (recordID) => {
    try {
      const oldRecord = await db.get(recordID);
      return oldRecord._rev;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  record._rev = await getRev(record._id);

  try {
    await db.put(record);
  } catch (error) {
    console.log(error);
  }
};

export const updateStaged = async (record) => {
  const getRev = async (recordID) => {
    try {
      const oldRecord = await stagedDB.get(recordID);
      return oldRecord._rev;
    } catch (error) {
      console.log(error);
      return;
    }
  };

  record._rev = await getRev(record._id);

  try {
    await stagedDB.put(record);
  } catch (error) {
    console.log(error);
  }
};

export const getRecords = async (options, filter) => {
  options.include_docs = true;

  const query = await db.allDocs(options);

  if (query.rows && query.rows.length) {
    const allRecords = query.rows.map(({ doc }) => doc);

    if (filter) {
      return allRecords
        .filter((record) => {
          return record.patientName
            .toLowerCase()
            .includes(filter.patientNameFilter);
        })
        .filter((record) => {
          return record.date.toLowerCase().includes(filter.dateFilter);
        })
        .filter((record) => {
          return record.age.toLowerCase().includes(filter.ageFilter);
        })
        .filter((record) => {
          return record.specimen.toLowerCase().includes(filter.specimenFilter);
        })
        .filter((record) => {
          return record.referer.toLowerCase().includes(filter.refererFilter);
        })
        .filter((record) => {
          return record.aspNote.toLowerCase().includes(filter.aspNoteFilter);
        })
        .filter((record) => {
          return record.me.toLowerCase().includes(filter.meFilter);
        })
        .filter((record) => {
          return record.impression
            .toLowerCase()
            .includes(filter.impressionFilter);
        });
    } else {
      return allRecords;
    }
  } else {
    return [];
  }
};

export const getStaged = async (options, filter) => {
  options.include_docs = true;

  const query = await stagedDB.allDocs(options);

  if (query.rows && query.rows.length) {
    const allRecords = query.rows.map(({ doc }) => doc);

    if (filter) {
      return allRecords
        .filter((record) => {
          return record.patientName
            .toLowerCase()
            .includes(filter.patientNameFilter);
        })
        .filter((record) => {
          return record.date.toLowerCase().includes(filter.dateFilter);
        })
        .filter((record) => {
          return record.age.toLowerCase().includes(filter.ageFilter);
        })
        .filter((record) => {
          return record.specimen.toLowerCase().includes(filter.specimenFilter);
        })
        .filter((record) => {
          return record.referer.toLowerCase().includes(filter.refererFilter);
        });
    } else {
      return allRecords;
    }
  } else {
    return [];
  }
};
